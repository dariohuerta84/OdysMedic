import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, RegisterRequest } from '../types/api';
import { authApi } from '../services/api';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'odyssmedic_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
      if (storedToken) {
        setToken(storedToken);
        try {
          const currentUser = await authApi.getMe();
          setUser(currentUser);
        } catch (error) {
          console.error('[OdyssMedic Auth] Failed to restore session:', error);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
          }
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      const accessToken = res.access_token;
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, accessToken);
      }
      setToken(accessToken);
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
      }
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      const accessToken = res.access_token;
      if (accessToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, accessToken);
        }
        setToken(accessToken);
        const currentUser = await authApi.getMe();
        setUser(currentUser);
      } else {
        await login(data.email, data.password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    setToken(null);
    setUser(null);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch (error) {
      console.error('[OdyssMedic Auth] Failed to refresh user profile:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
