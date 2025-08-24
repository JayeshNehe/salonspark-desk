-- Create salon_profiles table for comprehensive salon information
CREATE TABLE public.salon_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  business_license TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  website TEXT,
  description TEXT,
  services_offered TEXT[],
  operating_hours JSONB,
  social_media JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table for payment tracking
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES salon_profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.salon_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Salon profiles policies
CREATE POLICY "Users can view their own salon profile" ON public.salon_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own salon profile" ON public.salon_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own salon profile" ON public.salon_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Subscription policies  
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
FOR ALL USING (true);

-- Update appointments table to include more status options
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'waiting';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'in_progress';

-- Add billing integration to appointments
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS billing_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS billing_id UUID;

-- Create triggers for updated_at
CREATE TRIGGER update_salon_profiles_updated_at
BEFORE UPDATE ON public.salon_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions  
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();