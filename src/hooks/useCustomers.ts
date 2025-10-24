import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserSalonId, useHasRole } from './useUserRoles';
import { customerSchema } from '@/lib/validations';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  address?: string;
  date_of_birth?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export function useCustomers(searchQuery?: string) {
  const isAdminOrManager = useHasRole('admin') || useHasRole('manager');
  
  return useQuery({
    queryKey: ['customers', searchQuery, isAdminOrManager],
    queryFn: async (): Promise<Customer[]> => {
      // Admin and managers get full customer data via direct query
      if (isAdminOrManager) {
        let query = supabase.from('customers').select('*').order('created_at', { ascending: false });
        
        if (searchQuery) {
          query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }
      
      // Staff members get limited customer data (no PII like addresses, emails, birthdates)
      // via secure function to prevent unauthorized access
      const { data, error } = await supabase.rpc('search_customers_limited', {
        search_term: searchQuery || null
      });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: salonId } = useUserSalonId();

  return useMutation({
    mutationFn: async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
      // Validate input
      customerSchema.parse(customer);
      
      if (!salonId) throw new Error('Salon not found');
      
      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customer, salon_id: salonId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });
}