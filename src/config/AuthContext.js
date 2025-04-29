// src/config/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { isAuthenticated, getCurrentUser, logout, isAdmin } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi component mount
    const checkAuth = () => {
      if (isAuthenticated()) {
        setUser(getCurrentUser());
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    isAdmin: user ? user.role === 'admin' : false,
    logout: handleLogout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
