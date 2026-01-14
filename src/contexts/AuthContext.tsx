import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../lib/api';
import { UserPublic, queryKeys } from '@incident-tracker/shared';

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

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.me,
    retry: false,
    enabled: !!localStorage.getItem('accessToken'),
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    } else if (error) {
      // Only clear user if error is not a network/module error and there's no access token
      // This prevents clearing user on module loading errors
      const isNetworkError = error instanceof Error && (
        error.message.includes('Cannot find module') ||
        error.message.includes('MODULE_NOT_FOUND') ||
        error.message.includes('Failed to fetch')
      );
      
      if (!isNetworkError && !localStorage.getItem('accessToken')) {
        // Only clear user if there's no access token (refresh failed)
        setUser(null);
      }
    }
  }, [data, error]);

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
      queryClient.clear();
      localStorage.removeItem('accessToken');
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Check if we have an access token to determine if we should wait for auth check
  const hasAccessToken = !!localStorage.getItem('accessToken');
  
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
