import { createContext, useContext, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('hms_user');
    const token = localStorage.getItem('hms_token');
    if (stored && token) return JSON.parse(stored);
  } catch {
    localStorage.removeItem('hms_user');
    localStorage.removeItem('hms_token');
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading] = useState(false);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const data = res.data.data;
    localStorage.setItem('hms_token', data.token);
    localStorage.setItem('hms_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const data = res.data.data;
    localStorage.setItem('hms_token', data.token);
    localStorage.setItem('hms_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isDoctor = () => user?.role === 'DOCTOR';
  const isPatient = () => user?.role === 'PATIENT';
  const isReceptionist = () => user?.role === 'RECEPTIONIST';

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      isAdmin, isDoctor, isPatient, isReceptionist,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
