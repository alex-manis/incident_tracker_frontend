import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { authApi } from '../lib/api';
import { UserPublic, queryKeys } from '@incident-tracker/shared';

const ACCESS_TOKEN_KEY = 'accessToken';

interface AuthContextType {
  user: UserPublic | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const queryClient = useQueryClient();

  // Memoize access token check to avoid multiple localStorage reads
  const hasAccessToken = useMemo(() => !!localStorage.getItem(ACCESS_TOKEN_KEY), []);

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
        // Clear auth state on auth errors
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        setUser(null);
        // Invalidate auth queries
        queryClient.removeQueries({ queryKey: queryKeys.auth.me() });
      }
    }
  }, [data, error, queryClient]);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login({ email, password }),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setUser(null);
      // Clear all queries, cache, and cancel ongoing queries
      queryClient.clear();
      queryClient.cancelQueries();
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    },
    onError: () => {
      // Even if logout fails on backend, clear frontend state
      setUser(null);
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

  // User is authenticated if we have user data OR if we have access token and are still loading
  // This prevents redirect to login while token refresh is happening
  const isAuthenticated = !!user || (hasAccessToken && isLoading);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || loginMutation.isPending,
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
