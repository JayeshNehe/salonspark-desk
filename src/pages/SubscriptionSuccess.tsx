import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useVerifySubscription } from '@/hooks/useSalonProfile';

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verifySubscription = useVerifySubscription();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verifySubscription.mutate(sessionId);
    }
  }, [sessionId]);

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md card-premium text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
            Welcome to Your Salon!
          </CardTitle>
          <CardDescription>
            Your subscription has been activated successfully. You now have full access to all features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Your salon management system is ready to use. Start by exploring the dashboard and setting up your services.
          </div>
          
          <Button 
            onClick={handleContinue}
            className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
          >
            Continue to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}