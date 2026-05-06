// frontend/src/services/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate user from localStorage on mount
  useEffect(() => {
    const token    = localStorage.getItem('biic_token');
    const stored   = localStorage.getItem('biic_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('biic_token', token);
    localStorage.setItem('biic_user',  JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (payload) => {
    const res = await authAPI.register(payload);
    const { token, user: userData } = res.data;
    localStorage.setItem('biic_token', token);
    localStorage.setItem('biic_user',  JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('biic_token');
    localStorage.removeItem('biic_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
