import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const STORAGE_KEY = 'pizza_service_user';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data && (data.identifiant || data.login)) setUser(data);
        else localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    const data = { ...userData, token: token || '' };
    setUser(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getAuthHeaders = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    try {
      const data = JSON.parse(stored);
      if (data?.token) return { Authorization: `Bearer ${data.token}` };
    } catch (e) {}
    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
