import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';
import { Scissors, Users, Calendar, BarChart3, LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Scissors className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SalonPro
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete salon management solution for appointments, customers, inventory, and more.
            Streamline your business operations with our powerful tools.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-primary"
              onClick={() => navigate('/salon-registration')}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Get Started - Sign Up
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth')}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="card-premium">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Scheduling</h3>
              <p className="text-muted-foreground text-sm">
                Advanced appointment management with calendar integration
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-premium">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Customer Management</h3>
              <p className="text-muted-foreground text-sm">
                Complete customer profiles with history and preferences
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-premium">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics & Reports</h3>
              <p className="text-muted-foreground text-sm">
                Detailed insights into your business performance
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-premium">
            <CardContent className="p-6 text-center">
              <Scissors className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Service Management</h3>
              <p className="text-muted-foreground text-sm">
                Organize services, pricing, and staff assignments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Get Started Section */}
        <Card className="max-w-2xl mx-auto card-premium">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Ready to Transform Your Salon?</CardTitle>
            <CardDescription className="text-center text-lg">
              Join thousands of salon owners who trust SalonPro to manage their business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
                    onClick={() => navigate('/salon-registration')}>
                <div className="text-center">
                  <UserPlus className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">New to SalonPro?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create your account and register your salon
                  </p>
                  <Button className="w-full bg-gradient-primary hover:bg-gradient-primary/90">
                    Sign Up & Register Salon
                  </Button>
                </div>
              </Card>
              
              <Card className="p-4 border-2 border-muted hover:border-muted-foreground/40 transition-colors cursor-pointer"
                    onClick={() => navigate('/auth')}>
                <div className="text-center">
                  <LogIn className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Already have an account?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Sign in to access your salon dashboard
                  </p>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </div>
              </Card>
            </div>
            
            <Separator />
            
            <div className="text-center text-sm text-muted-foreground">
              <p>🔒 Your data is secure and encrypted</p>
              <p>📞 24/7 customer support available</p>
              <p>💰 30-day money-back guarantee</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}