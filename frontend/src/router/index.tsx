import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext';
import Login from '../features/auth/pages/Login';
import Dashboard from '../features/dashboard/Dashboard';
import NetworkMapPage from '../features/config/pages/NetworkMapPage';
import RulePage from '../features/config/pages/RulePage';
import TypologyPage from '../features/config/pages/TypologyPage';
import { ROUTES } from '../shared/config/routes.config';
import { setupFetch401Interceptor } from '../utils/common/interceptor';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const { loading } = useAuth();

  useEffect(() => {
    setupFetch401Interceptor(async () => {
      navigate(ROUTES.LOGIN);
    });
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<div />} />
        <Route
          path={ROUTES.NETWORK_MAP}
          element={<NetworkMapPage />}
        />
        <Route
          path={ROUTES.RULE}
          element={<RulePage />}
        />
        <Route
          path={ROUTES.TYPOLOGY}
          element={<TypologyPage />}
        />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};
