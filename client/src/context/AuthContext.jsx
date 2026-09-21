import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail'));
  const [userName, setUserName] = useState(() => localStorage.getItem('userName'));

  const login = (email, name) => {
    setUserEmail(email);
    localStorage.setItem('userEmail', email);
    if (name) {
      setUserName(name);
      localStorage.setItem('userName', name);
    }
  };

  const logout = () => {
    setUserEmail(null);
    setUserName(null);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('lastScanId');
    localStorage.removeItem('lastScanUrl');
  };

  return (
    <AuthContext.Provider value={{ userEmail, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
