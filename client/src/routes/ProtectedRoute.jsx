import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/ui/Skeleton';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5B6CFF] mx-auto"></div>
          <p className="text-xs text-[#8A91AD] font-medium">Authenticating secure session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
