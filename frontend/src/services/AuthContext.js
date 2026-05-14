// frontend/src/services/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token  = localStorage.getItem('p5_token');
    const stored = localStorage.getItem('p5_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('p5_token', token);
    localStorage.setItem('p5_user',  JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (payload) => {
    const res = await authAPI.register(payload);
    const { token, user: userData } = res.data;
    localStorage.setItem('p5_token', token);
    localStorage.setItem('p5_user',  JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('p5_token');
    localStorage.removeItem('p5_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
