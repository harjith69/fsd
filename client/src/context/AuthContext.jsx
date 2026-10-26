import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, academicYearsApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  // Load active user session and academic years on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const [meRes, yearsRes] = await Promise.allSettled([
          authApi.getMe(),
          academicYearsApi.list(),
        ]);

        if (meRes.status === 'fulfilled' && meRes.value.data.success) {
          setUser(meRes.value.data.user);
        }

        if (yearsRes.status === 'fulfilled' && yearsRes.value.data.success) {
          const years = yearsRes.value.data.years || [];
          setAcademicYears(years);
          const current = years.find((y) => y.isCurrent) || years[0];
          setSelectedYear(current || null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      setUser(res.data.user);
      // Fetch academic years if not loaded
      if (academicYears.length === 0) {
        const yearsRes = await academicYearsApi.list();
        const years = yearsRes.data.years || [];
        setAcademicYears(years);
        const current = years.find((y) => y.isCurrent) || years[0];
        setSelectedYear(current || null);
      }
      return res.data.user;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        loading,
        login,
        logout,
        refreshUser,
        academicYears,
        selectedYear,
        setSelectedYear,
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
