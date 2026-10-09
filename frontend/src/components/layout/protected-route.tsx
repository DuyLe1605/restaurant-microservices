import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { Role } from '@/types/auth';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const fallbackPath = user.role === 'USER' ? '/tables' : '/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}
