import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RoleRoute = ({ allowedRoles = [] }) => {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // If not authorized for this specific role route, redirect to their own dashboard
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'hod') return <Navigate to="/hod" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
