import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail'));
  const [userName, setUserName] = useState(() => localStorage.getItem('userName'));
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = (token, email, name) => {
    setToken(token);
    setUserEmail(email);
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    if (name) {
      setUserName(name);
      localStorage.setItem('userName', name);
    }
  };

  const logout = () => {
    setToken(null);
    setUserEmail(null);
    setUserName(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  };

  return (
    <AuthContext.Provider value={{ token, userEmail, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
