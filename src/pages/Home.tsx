import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';
import { Scissors, Users, Calendar, BarChart3, LogIn, UserPlus, Sparkles, Star, CheckCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Hero Section */}
      <div className="relative container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          {/* Animated Logo */}
          <div className="flex items-center justify-center mb-6 animate-fade-in">
            <div className="relative">
              <Scissors className="w-16 h-16 text-primary mr-4 animate-bounce" style={{animationDelay: '0.5s'}} />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SalonPro
            </h1>
          </div>
          
          {/* Animated Subtitle */}
          <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
            <p className="text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              Transform Your Salon Business
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Complete management solution for appointments, customers, inventory, and analytics.
              Join thousands of successful salon owners.
            </p>
          </div>
          
          {/* Action Buttons with Animation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-scale-in" style={{animationDelay: '0.6s'}}>
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover-scale group"
              onClick={() => navigate('/salon-registration')}
            >
              <UserPlus className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              Start Free Trial - Sign Up
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 hover:bg-primary/5 transition-all duration-300 hover-scale"
              onClick={() => navigate('/auth')}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Already a Member? Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid with Staggered Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Calendar, title: "Smart Scheduling", desc: "AI-powered appointment management", delay: '0.1s' },
            { icon: Users, title: "Customer Hub", desc: "Complete customer profiles & history", delay: '0.2s' },
            { icon: BarChart3, title: "Analytics Pro", desc: "Real-time business insights", delay: '0.3s' },
            { icon: Scissors, title: "Service Manager", desc: "Streamlined service operations", delay: '0.4s' }
          ].map((feature, index) => (
            <Card key={index} className="card-premium hover-scale animate-fade-in group hover:shadow-lg transition-all duration-300" style={{animationDelay: feature.delay}}>
              <CardContent className="p-6 text-center">
                <feature.icon className="w-12 h-12 text-primary mx-auto mb-4 group-hover:animate-pulse" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Social Proof */}
        <div className="text-center mb-16 animate-fade-in" style={{animationDelay: '0.8s'}}>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
            ))}
          </div>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">10,000+</span> salon owners trust SalonPro
          </p>
        </div>

        {/* Main CTA Section */}
        <Card className="max-w-4xl mx-auto card-premium animate-scale-in shadow-2xl" style={{animationDelay: '1s'}}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Ready to Revolutionize Your Salon?</CardTitle>
            <CardDescription className="text-lg">
              Choose your path to success
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sign Up Card */}
              <Card className="p-6 border-2 border-primary/30 hover:border-primary/60 transition-all duration-300 cursor-pointer hover-scale group relative overflow-hidden"
                    onClick={() => navigate('/salon-registration')}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">New to SalonPro?</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your account, register your salon, and start your journey
                  </p>
                  <div className="space-y-2 mb-4">
                    {['30-day free trial', 'No setup fees', 'Full feature access'].map((benefit, i) => (
                      <div key={i} className="flex items-center justify-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-gradient-primary hover:bg-gradient-primary/90 group-hover:shadow-lg transition-all duration-300">
                    Get Started Free
                  </Button>
                </div>
              </Card>
              
              {/* Sign In Card */}
              <Card className="p-6 border-2 border-muted hover:border-muted-foreground/60 transition-all duration-300 cursor-pointer hover-scale group"
                    onClick={() => navigate('/auth')}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-muted-foreground/10 transition-colors duration-300">
                    <LogIn className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Welcome Back!</h3>
                  <p className="text-muted-foreground mb-4">
                    Access your salon dashboard and continue managing your business
                  </p>
                  <div className="space-y-2 mb-4">
                    {['Quick access', 'Secure login', 'All your data'].map((benefit, i) => (
                      <div key={i} className="flex items-center justify-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full border-2 hover:bg-muted/50 transition-all duration-300">
                    Sign In to Dashboard
                  </Button>
                </div>
              </Card>
            </div>
            
            <Separator />
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  🔒
                </div>
                <p>Bank-level Security</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  📞
                </div>
                <p>24/7 Support</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  💰
                </div>
                <p>Money-back Guarantee</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}