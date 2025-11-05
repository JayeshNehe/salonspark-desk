import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: AppRole[];
  redirectTo?: string;
}

export function RoleProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = '/dashboard'
}: RoleProtectedRouteProps) {
  const { data: roles, isLoading } = useUserRoles();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const hasPermission = roles?.some(role => allowedRoles.includes(role.role));

  if (!hasPermission) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
