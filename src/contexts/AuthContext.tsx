'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('propcrm_token');
    const storedUser = localStorage.getItem('propcrm_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      connectSocket(JSON.parse(storedUser)._id);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const { user: u, token: t } = res.data;
    setUser(u);
    setToken(t);
    localStorage.setItem('propcrm_token', t);
    localStorage.setItem('propcrm_user', JSON.stringify(u));
    connectSocket(u._id);
  };

  const logout = () => {
    authAPI.logout().catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('propcrm_token');
    localStorage.removeItem('propcrm_user');
    disconnectSocket();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
