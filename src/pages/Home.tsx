import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';
import { Scissors, LogIn, UserPlus, Sparkles, Star, CheckCircle, Calendar, Users, BarChart3, Shield, Phone, DollarSign } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-40 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Main Content Container */}
      <div className="relative">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo & Brand */}
            <div className="flex items-center justify-center mb-8 animate-fade-in">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-primary mr-4">
                  <Scissors className="w-10 h-10 text-white" />
                </div>
                <Sparkles className="w-6 h-6 text-secondary absolute -top-2 -right-2 animate-bounce" style={{animationDelay: '0.5s'}} />
              </div>
              <div>
                <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  SalonPro
                </h1>
                <p className="text-sm text-muted-foreground tracking-widest uppercase mt-1">
                  Premium Salon Management
                </p>
              </div>
            </div>
            
            {/* Main Headline */}
            <div className="animate-fade-in mb-12" style={{animationDelay: '0.2s'}}>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                Transform Your Salon into a 
                <span className="block bg-gradient-hero bg-clip-text text-transparent mt-2">
                  Thriving Business
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The complete management solution trusted by over 10,000 salon owners worldwide.
                Streamline appointments, manage customers, and grow your business effortlessly.
              </p>
            </div>

            {/* Main Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16 animate-scale-in" style={{animationDelay: '0.4s'}}>
              {/* Sign Up Card */}
              <Card className="group relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 cursor-pointer hover-scale card-premium"
                    onClick={() => navigate('/salon-registration')}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-primary group-hover:animate-pulse">
                    <UserPlus className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Start Your Journey</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    New to SalonPro? Create your account and register your salon to begin transforming your business.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    {[
                      { text: '30-day free trial', icon: CheckCircle },
                      { text: 'Complete setup guide', icon: CheckCircle },
                      { text: 'No credit card required', icon: CheckCircle }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-center gap-3">
                        <item.icon className="w-5 h-5 text-success" />
                        <span className="text-foreground font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button size="lg" className="w-full bg-gradient-primary hover:shadow-primary transition-all duration-300 text-lg py-6">
                    Sign Up & Register Salon
                  </Button>
                </CardContent>
              </Card>
              
              {/* Sign In Card */}
              <Card className="group relative overflow-hidden border-2 border-muted hover:border-primary/20 transition-all duration-500 cursor-pointer hover-scale card-premium"
                    onClick={() => navigate('/auth')}>
                <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 text-center">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/10 transition-colors duration-300">
                    <LogIn className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Welcome Back</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Already have a SalonPro account? Sign in to access your dashboard and continue managing your salon.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    {[
                      { text: 'Instant access', icon: CheckCircle },
                      { text: 'All your data safe', icon: CheckCircle },
                      { text: 'Continue where you left', icon: CheckCircle }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-center gap-3">
                        <item.icon className="w-5 h-5 text-primary" />
                        <span className="text-foreground font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button size="lg" variant="outline" className="w-full border-2 border-primary/20 hover:bg-primary/5 text-lg py-6">
                    Sign In to Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Features Preview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-slide-up" style={{animationDelay: '0.6s'}}>
              {[
                { icon: Calendar, title: "Smart Scheduling", color: "text-primary" },
                { icon: Users, title: "Customer Management", color: "text-accent-foreground" },
                { icon: BarChart3, title: "Business Analytics", color: "text-secondary-dark" },
                { icon: Scissors, title: "Service Operations", color: "text-primary" }
              ].map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-card rounded-xl flex items-center justify-center mx-auto mb-3 shadow-soft group-hover:shadow-medium transition-all duration-300">
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="animate-fade-in mb-12" style={{animationDelay: '0.8s'}}>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-secondary fill-current animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                ))}
              </div>
              <p className="text-lg text-muted-foreground">
                Trusted by <span className="font-bold text-foreground text-xl">10,000+</span> salon professionals worldwide
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto animate-fade-in" style={{animationDelay: '1s'}}>
              {[
                { icon: Shield, text: "Bank-Level Security", color: "text-success" },
                { icon: Phone, text: "24/7 Support", color: "text-primary" },
                { icon: DollarSign, text: "Money-Back Guarantee", color: "text-secondary-dark" }
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center mx-auto mb-2 shadow-soft">
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}