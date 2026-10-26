import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';

import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';

import { Login } from './pages/Login';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { TeachingPage } from './pages/TeachingPage';
import { PublicationsPage } from './pages/PublicationsPage';
import { FdpsPage } from './pages/FdpsPage';
import { ConsultancyPage } from './pages/ConsultancyPage';
import { PatentsPage } from './pages/PatentsPage';
import { HodDashboard } from './pages/HodDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Root redirector based on authenticated user role
const RootRedirect = () => {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'hod') return <Navigate to="/hod" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Root index redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Protected App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* Faculty & Shared Activity Module Routes */}
                <Route path="/dashboard" element={<FacultyDashboard />} />
                <Route path="/teaching" element={<TeachingPage />} />
                <Route path="/publications" element={<PublicationsPage />} />
                <Route path="/fdps" element={<FdpsPage />} />
                <Route path="/consultancy" element={<ConsultancyPage />} />
                <Route path="/patents" element={<PatentsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* HoD Routes */}
                <Route element={<RoleRoute allowedRoles={['hod', 'admin']} />}>
                  <Route path="/hod" element={<HodDashboard />} />
                  <Route path="/hod/approvals" element={<HodDashboard />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<RoleRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminDashboard />} />
                  <Route path="/admin/departments" element={<AdminDashboard />} />
                  <Route path="/admin/scoring" element={<AdminDashboard />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
