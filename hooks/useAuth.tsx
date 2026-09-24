'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@/types';
import { auth } from '@/lib/auth';
import { getAccessToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (credentials: { username_or_email: string; password: string }) => Promise<User>;
  register: (data: { username: string; email: string; password: string; confirm_password: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await auth.me();
      setUser(userData);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        // If we don't have token in memory, try refreshing via HttpOnly cookie
        if (!getAccessToken()) {
          const newToken = await auth.refresh();
          if (!newToken) {
            if (isMounted) {
              setUser(null);
              setLoading(false);
              setInitialized(true);
            }
            return;
          }
        }

        const currentUser = await auth.me();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: { username_or_email: string; password: string }) => {
    setLoading(true);
    try {
      const loggedInUser = await auth.login(credentials);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { username: string; email: string; password: string; confirm_password: string }) => {
    setLoading(true);
    try {
      const newUser = await auth.register(data);
      setUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await auth.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
