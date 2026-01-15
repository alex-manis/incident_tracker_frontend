import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { authApi } from '../lib/api';
import { UserPublic, queryKeys } from '@incident-tracker/shared';

const ACCESS_TOKEN_KEY = 'accessToken';

interface AuthContextType {
  user: UserPublic | null;
  isLoading: boolean; // Loading state for auth check (me query)
  isLoggingIn: boolean; // Loading state for login mutation
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [hasAccessToken, setHasAccessToken] = useState(() => !!localStorage.getItem(ACCESS_TOKEN_KEY));
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.me,
    retry: false,
    enabled: hasAccessToken,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    }

    if (error) {
      const status = (error as AxiosError)?.response?.status;
      if (status === 401 || status === 403) {
        // Check if token still exists (might have been refreshed by interceptor)
        const currentToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (!currentToken) {
          // Token refresh failed - clear auth state
          setHasAccessToken(false);
          setUser(null);
          // Invalidate auth queries
          queryClient.removeQueries({ queryKey: queryKeys.auth.me() });
        }
        // If token exists, interceptor might have refreshed it
        // The query will be retried automatically by React Query
      }
    }
  }, [data, error, queryClient]);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login({ email, password }),
    onSuccess: (data) => {
      setHasAccessToken(true);
      setUser(data.user);
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setUser(null);
      setHasAccessToken(false);
      // Clear all queries, cache, and cancel ongoing queries
      queryClient.clear();
      queryClient.cancelQueries();
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    },
    onError: () => {
      // Even if logout fails on backend, clear frontend state
      setUser(null);
      setHasAccessToken(false);
      queryClient.clear();
      queryClient.cancelQueries();
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // User is authenticated if we have user data
  // OR if we have access token and are still checking (isLoading)
  // OR if we have access token and haven't received a final auth error yet
  // This prevents redirect to login while token refresh/auth check is happening
  const hasAuthError = error && ((error as AxiosError)?.response?.status === 401 || (error as AxiosError)?.response?.status === 403);
  const tokenStillExists = !!localStorage.getItem(ACCESS_TOKEN_KEY);
  const isAuthenticated = !!user || (hasAccessToken && tokenStillExists && (isLoading || !hasAuthError));

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading, // Auth check loading state
        isLoggingIn: loginMutation.isPending, // Login mutation loading state
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
