import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useSalonProfile, useSubscription } from '@/hooks/useSalonProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { data: salonProfile, isLoading: salonLoading } = useSalonProfile();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();

  if (loading || salonLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is authenticated but doesn't have salon profile, redirect to registration
  if (!salonProfile) {
    return <Navigate to="/salon-registration" replace />;
  }

  // If salon profile exists but no active subscription, redirect to registration
  if (!subscription || subscription.status !== 'active') {
    return <Navigate to="/salon-registration" replace />;
  }

  return <>{children}</>;
}