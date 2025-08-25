import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/AuthProvider';
import { useCreateSalonProfile, useCreateSubscription, useSalonProfile } from '@/hooks/useSalonProfile';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, ArrowLeft, UserPlus } from 'lucide-react';

const plans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: '₹999',
    period: '/month',
    description: 'Perfect for small salons',
    features: [
      'Up to 100 appointments/month',
      'Customer management',
      'Basic reporting',
      'Email support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: '₹1,999',
    period: '/month',
    description: 'Most popular for growing salons',
    features: [
      'Unlimited appointments',
      'Advanced customer management',
      'Detailed analytics & reports',
      'Inventory management',
      'Staff management',
      'Priority support'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan', 
    price: '₹4,999',
    period: '/month',
    description: 'For large salon chains',
    features: [
      'Everything in Premium',
      'Multi-location support',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 phone support',
      'Advanced security'
    ]
  }
];

export default function SalonRegistration() {
  const [step, setStep] = useState(0); // Start with step 0 for sign up
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [formData, setFormData] = useState({
    salon_name: '',
    owner_name: '',
    business_license: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'India',
    website: '',
    description: '',
    services_offered: [] as string[]
  });

  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: salonProfile, isLoading } = useSalonProfile();
  const createSalonProfile = useCreateSalonProfile();
  const createSubscription = useCreateSubscription();

  // Redirect if already has salon profile and user is authenticated
  useEffect(() => {
    if (user && salonProfile && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [user, salonProfile, isLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, {
      first_name: firstName,
      last_name: lastName,
    });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Account created successfully! Please complete your salon registration.",
      });
      setStep(1);
    }
    
    setLoading(false);
  };

  const handleSalonRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      await createSalonProfile.mutateAsync({
        ...formData,
        user_id: user.id,
        email: user.email || formData.email
      });
      setStep(2);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscription = async () => {
    setLoading(true);
    try {
      await createSubscription.mutateAsync(selectedPlan);
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (step === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <Card className="w-full max-w-md card-premium">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </div>
            <CardTitle className="text-2xl text-center bg-gradient-primary bg-clip-text text-transparent">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-center">
              Sign up to register your salon and get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name *</Label>
                  <Input
                    id="first-name"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name *</Label>
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
                <Label htmlFor="signup-email">Email *</Label>
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
                <Label htmlFor="signup-password">Password *</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
                disabled={loading}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold text-primary"
                  onClick={() => navigate('/auth')}
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <Card className="w-full max-w-4xl card-premium">
          <CardHeader>
            <CardTitle className="text-3xl text-center bg-gradient-primary bg-clip-text text-transparent">
              Register Your Salon
            </CardTitle>
            <CardDescription className="text-center text-lg">
              Complete your salon profile to get started with our management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSalonRegistration} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salon_name">Salon Name *</Label>
                    <Input
                      id="salon_name"
                      name="salon_name"
                      value={formData.salon_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Owner Name *</Label>
                    <Input
                      id="owner_name"
                      name="owner_name"
                      value={formData.owner_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_license">Business License</Label>
                    <Input
                      id="business_license"
                      name="business_license"
                      value={formData.business_license}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">ZIP Code *</Label>
                    <Input
                      id="zip_code"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || user.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
                disabled={loading}
              >
                {loading ? "Creating Profile..." : "Continue to Subscription"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-6xl card-premium">
        <CardHeader>
          <CardTitle className="text-3xl text-center bg-gradient-primary bg-clip-text text-transparent">
            Choose Your Plan
          </CardTitle>
          <CardDescription className="text-center text-lg">
            Select a subscription plan to activate your salon management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
                } ${plan.popular ? 'border-primary' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-primary">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {plan.id === 'basic' && <Zap className="w-5 h-5 text-blue-500" />}
                    {plan.id === 'premium' && <Star className="w-5 h-5 text-purple-500" />}
                    {plan.id === 'enterprise' && <Crown className="w-5 h-5 text-yellow-500" />}
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back to Registration
            </Button>
            <Button 
              onClick={handleSubscription}
              className="bg-gradient-primary hover:bg-gradient-primary/90"
              disabled={loading}
            >
              {loading ? "Processing..." : "Subscribe & Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}