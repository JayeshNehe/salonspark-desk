import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SalonProfile {
  id: string;
  user_id: string;
  salon_name: string;
  owner_name: string;
  business_license?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  website?: string;
  description?: string;
  services_offered?: string[];
  operating_hours?: any;
  social_media?: any;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  salon_id: string;
  plan_type: string;
  status: string;
  current_period_end: string;
  amount: number;
  currency: string;
}

export function useSalonProfile() {
  return useQuery({
    queryKey: ['salon-profile'],
    queryFn: async (): Promise<SalonProfile | null> => {
      const { data, error } = await supabase
        .from('salon_profiles')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async (): Promise<Subscription | null> => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
  });
}

export function useCreateSalonProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (profile: Omit<SalonProfile, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('salon_profiles')
        .insert([profile])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-profile'] });
      toast({
        title: "Success",
        description: "Salon profile created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create salon profile",
        variant: "destructive",
      });
    },
  });
}

export function useCreateSubscription() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (planType: string) => {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { planType }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });
}

export function useVerifySubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.functions.invoke('verify-subscription', {
        body: { sessionId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast({
        title: "Success",
        description: "Subscription activated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to verify subscription",
        variant: "destructive",
      });
    },
  });
}