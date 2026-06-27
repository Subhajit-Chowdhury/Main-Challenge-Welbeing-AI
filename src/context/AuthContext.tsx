import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import bcrypt from 'bcryptjs';
import { authDb } from '../../database/auth-db';
import { AppSession } from '../../types';

interface AuthContextType {
  user: AppSession['user'];
  isLoading: boolean;
  error: string | null;
  login: (usernameOrEmail: string, passwordPlain: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  getUserStorageKey: (key: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppSession['user']>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for persisted session on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('cleanapp_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.user) {
          setUser(parsed.user);
        }
      }
    } catch (e) {
      console.error('[AuthContext] Failed to load session from storage:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (usernameOrEmail: string, passwordPlain: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const trimmedUser = usernameOrEmail.trim();
      if (!trimmedUser || !passwordPlain) {
        setError('Username/Email and password are required.');
        setIsLoading(false);
        return false;
      }

      // Query database/localStorage user
      const foundUser = await authDb.findUser(trimmedUser);
      if (!foundUser) {
        setError('Invalid credentials.');
        setIsLoading(false);
        return false;
      }

      // Verify bcrypt hash
      const isMatch = await bcrypt.compare(passwordPlain, foundUser.passwordHash);
      if (!isMatch) {
        setError('Invalid credentials.');
        setIsLoading(false);
        return false;
      }

      const activeUser = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email
      };

      // Set state and persist session
      setUser(activeUser);
      localStorage.setItem('cleanapp_session', JSON.stringify({ user: activeUser }));
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('[AuthContext] Login error:', err);
      setError('An error occurred during login. Please try again.');
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cleanapp_session');
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Helper function to return user-isolated keys for LocalStorage or database
  const getUserStorageKey = useCallback((key: string): string => {
    if (!user) return key;
    return `${key}_user_${user.id}`;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        clearError,
        getUserStorageKey
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
