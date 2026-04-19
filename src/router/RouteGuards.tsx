import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
}

interface RequireRoleProps {
  children: ReactNode;
  allowedRoles: string[];
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center text-white/70">
        Loading your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export const RequireRole = ({ children, allowedRoles }: RequireRoleProps) => {
  const { user } = useAuth();

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const hasAllowedRole = allowedRoles.some((role) => roles.includes(role));

  if (!hasAllowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
