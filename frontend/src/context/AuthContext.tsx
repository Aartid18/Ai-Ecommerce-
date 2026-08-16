import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, RoleType } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  hasRole: (role: RoleType) => boolean;
  isAdmin: boolean;
  isInventoryManager: boolean;
  isOrderManager: boolean;
  isCustomer: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  switchDemoPersona: (username: string, password: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { usernameOrEmail, password });
      const authData = res.data;
      const loggedUser: User = {
        id: authData.id,
        username: authData.username,
        email: authData.email,
        fullName: authData.fullName || authData.username,
        roles: authData.roles.map((r: string) => r.replace('ROLE_', '') as RoleType),
        token: authData.token,
        refreshToken: authData.refreshToken,
      };

      localStorage.setItem('token', authData.token);
      if (authData.refreshToken) {
        localStorage.setItem('refreshToken', authData.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      showToast(`Welcome back, ${loggedUser.username}!`, 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid username or password';
      showToast(msg, 'error', 'Login Failed');
      throw err;
    }
  };

  const register = async (payload: any) => {
    try {
      await api.post('/auth/register', payload);
      showToast('Registration successful! You can now login.', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      showToast(msg, 'error', 'Registration Error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const switchDemoPersona = async (username: string, password: string) => {
    logout();
    await login(username, password);
  };

  const hasRole = (role: RoleType): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  const isAdmin = hasRole('ADMIN');
  const isInventoryManager = hasRole('INVENTORY_MANAGER') || isAdmin;
  const isOrderManager = hasRole('ORDER_MANAGER') || isAdmin;
  const isCustomer = hasRole('CUSTOMER') || user?.roles.length === 0;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        hasRole,
        isAdmin,
        isInventoryManager,
        isOrderManager,
        isCustomer,
        login,
        register,
        logout,
        switchDemoPersona,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
