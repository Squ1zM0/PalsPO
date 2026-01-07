import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';
import { normalizeError } from '../utils/errorFormatter';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('AuthContext: Loading user from token...');
          const userData = await authService.getMe();
          console.log('AuthContext: User loaded successfully');
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user:', error);
          console.error('Load user error type:', typeof error);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login...');
      const response = await authService.login(email, password);
      console.log('AuthContext: Login successful, fetching user data...');
      const userData = await authService.getMe();
      console.log('AuthContext: User data fetched successfully');
      setUser(userData);
      return response;
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      console.error('Login error type:', typeof error);
      console.error('Login error constructor:', error?.constructor?.name);
      
      // Normalize to Error instance and re-throw
      throw normalizeError(error, 'Login failed. Please try again.');
    }
  };

  const register = async (email, password, alias) => {
    try {
      console.log('AuthContext: Starting registration...');
      const response = await authService.register(email, password, alias);
      console.log('AuthContext: Registration successful, fetching user data...');
      const userData = await authService.getMe();
      console.log('AuthContext: User data fetched successfully');
      setUser(userData);
      return response;
    } catch (error) {
      console.error('Register error in AuthContext:', error);
      console.error('Register error type:', typeof error);
      console.error('Register error constructor:', error?.constructor?.name);
      
      // Normalize to Error instance and re-throw
      throw normalizeError(error, 'Registration failed. Please try again.');
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
