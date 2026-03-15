import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/utils/constants';
import { authAPI } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, phoneNumber?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user && parsed.token) {
          return { user: parsed.user, token: parsed.token, isAuthenticated: true };
        }
      } catch { /* ignore */ }
    }
    return { user: null, token: null, isAuthenticated: false };
  });

  useEffect(() => {
    if (state.isAuthenticated && state.user && state.token) {
      localStorage.setItem('auth', JSON.stringify({ user: state.user, token: state.token }));
    } else {
      localStorage.removeItem('auth');
    }
  }, [state]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    const { user, token } = response.data;
    const normalizedUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    };
    // Persist immediately so initial data fetches after login include the token
    localStorage.setItem('auth', JSON.stringify({ user: normalizedUser, token }));
    setState({ user: normalizedUser, token, isAuthenticated: true });
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    phoneNumber?: string
  ) => {
    const response = await authAPI.register(name, email, password, role, phoneNumber);
    const { user, token } = response.data;
    const normalizedUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    };
    // Persist immediately so initial data fetches after signup include the token
    localStorage.setItem('auth', JSON.stringify({ user: normalizedUser, token }));
    setState({ user: normalizedUser, token, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    // Call backend logout (fire and forget)
    if (state.token) {
      authAPI.logout().catch(() => {});
    }
    setState({ user: null, token: null, isAuthenticated: false });
  }, [state.token]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
