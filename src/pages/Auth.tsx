import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { authSchema } from '@/lib/validations';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userType, setUserType] = useState<'admin' | 'receptionist'>('receptionist');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();

  // Demo login function
  const handleDemoLogin = async () => {
    setLoading(true);
    // Use demo credentials
    const demoEmail = 'demo@salon.com';
    const demoPassword = 'demo123';
    
    const { error } = await signIn(demoEmail, demoPassword);
    
    if (error) {
      // If demo user doesn't exist, create it
      const { error: signUpError } = await signUp(demoEmail, demoPassword, {
        first_name: 'Demo',
        last_name: 'User',
      });
      
      if (!signUpError) {
        // Try signing in again after signup
        setTimeout(async () => {
          const { error: secondSignInError } = await signIn(demoEmail, demoPassword);
          if (!secondSignInError) {
            toast({
              title: "Success",
              description: "Demo account created and logged in!",
            });
          }
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: signUpError.message || "Failed to create demo account",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Success",
        description: "Logged in with demo account!",
      });
    }
    
    setLoading(false);
  };

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      authSchema.parse({ email, password });
      
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to sign in",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.errors?.[0]?.message || "Invalid email or password format",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      authSchema.parse({ email, password });
      
      const { error } = await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to sign up",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.errors?.[0]?.message || "Invalid input. Password must be at least 8 characters with uppercase, lowercase, number, and special character.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md card-premium">
        <CardHeader>
          <CardTitle className="text-2xl text-center bg-gradient-primary bg-clip-text text-transparent">
            Salon Management
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to access your salon dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* User Type Selection */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setUserType('admin')}
                variant={userType === 'admin' ? 'default' : 'outline'}
                className={cn(
                  "transition-smooth",
                  userType === 'admin' && "bg-gradient-primary text-primary-foreground shadow-primary"
                )}
              >
                Admin Login
              </Button>
              <Button
                onClick={() => setUserType('receptionist')}
                variant={userType === 'receptionist' ? 'default' : 'outline'}
                className={cn(
                  "transition-smooth",
                  userType === 'receptionist' && "bg-gradient-primary text-primary-foreground shadow-primary"
                )}
              >
                Receptionist Login
              </Button>
            </div>
          </div>
          
          {/* Demo Login Button */}
          <div className="space-y-4 mb-6">
            <Button 
              onClick={handleDemoLogin}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold"
              disabled={loading}
              size="lg"
            >
              {loading ? "Logging in..." : "🚀 Quick Demo Login"}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters with uppercase, lowercase, number, and special character
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}