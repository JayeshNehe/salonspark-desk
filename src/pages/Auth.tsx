import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { authSchema } from '@/lib/validations';
import { Scissors, ShieldCheck, UserCheck, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type LoginType = 'admin' | 'receptionist';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState<LoginType>('admin');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signOut } = useAuth();
  const { toast } = useToast();

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
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Get the current user after successful sign in
      const { data: { user: signedInUser } } = await supabase.auth.getUser();
      
      if (!signedInUser) {
        toast({
          title: "Login Failed",
          description: "Unable to verify user",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check user's role
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', signedInUser.id);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        await signOut();
        toast({
          title: "Login Failed",
          description: "Unable to verify user role",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if user is a salon owner (admin) by checking salon_profiles
      const { data: salonProfile } = await supabase
        .from('salon_profiles')
        .select('id')
        .eq('user_id', signedInUser.id)
        .maybeSingle();

      const isAdmin = salonProfile !== null || userRoles?.some(r => r.role === 'admin');
      const isReceptionist = userRoles?.some(r => r.role === 'receptionist');

      // Validate login type matches user role
      if (loginType === 'admin' && !isAdmin) {
        await signOut();
        toast({
          title: "Access Denied",
          description: "This login is for Admin/Owner only. Please use Receptionist login.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (loginType === 'receptionist' && !isReceptionist) {
        await signOut();
        toast({
          title: "Access Denied",
          description: "This login is for Receptionist only. Please use Admin/Owner login.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Welcome Back!",
        description: `Signed in successfully as ${loginType}`,
      });
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.errors?.[0]?.message || "Please enter a valid email and password",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-primary rounded-full opacity-10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-secondary rounded-full opacity-10 blur-3xl" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="card-premium">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg">
              <Scissors className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Salon Login
            </CardTitle>
            <CardDescription>
              Sign in to access your salon dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Login Type Selection */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => setLoginType('admin')}
                variant={loginType === 'admin' ? 'default' : 'outline'}
                className={cn(
                  "h-auto py-4 flex flex-col gap-2 transition-all",
                  loginType === 'admin' && "bg-gradient-primary text-primary-foreground shadow-lg scale-[1.02]"
                )}
              >
                <ShieldCheck className="w-6 h-6" />
                <span className="font-semibold">Admin / Owner</span>
              </Button>
              <Button
                type="button"
                onClick={() => setLoginType('receptionist')}
                variant={loginType === 'receptionist' ? 'default' : 'outline'}
                className={cn(
                  "h-auto py-4 flex flex-col gap-2 transition-all",
                  loginType === 'receptionist' && "bg-gradient-primary text-primary-foreground shadow-lg scale-[1.02]"
                )}
              >
                <UserCheck className="w-6 h-6" />
                <span className="font-semibold">Receptionist</span>
              </Button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            {/* Info Text */}
            <div className="text-center space-y-2 pt-2">
              <p className="text-sm text-muted-foreground">
                {loginType === 'admin' 
                  ? "Login with your admin credentials to manage your salon"
                  : "Login with the credentials provided by your salon admin"
                }
              </p>
              
              {loginType === 'admin' && (
                <p className="text-sm">
                  Don't have a salon account?{' '}
                  <Link to="/salon-registration" className="text-primary hover:underline font-medium">
                    Register your salon
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}