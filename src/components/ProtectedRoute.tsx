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

  // Show loading while checking authentication and data
  if (loading || salonLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user, redirect to home page (not auth directly)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user exists but no salon profile, redirect to registration
  if (user && !salonProfile) {
    return <Navigate to="/salon-registration" replace />;
  }

  // If salon profile exists but no active subscription, redirect to registration
  if (salonProfile && (!subscription || subscription.status !== 'active')) {
    return <Navigate to="/salon-registration" replace />;
  }

  // All checks passed, render the protected content
  return <>{children}</>;
}