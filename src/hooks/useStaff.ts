import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserSalonId } from './useUserRoles';
import { staffSchema } from '@/lib/validations';

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  specialization: string[];
  hire_date: string;
  salary?: number;
  commission_rate?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async (): Promise<Staff[]> => {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: salonId } = useUserSalonId();

  return useMutation({
    mutationFn: async (staff: Omit<Staff, 'id' | 'created_at' | 'updated_at'>) => {
      // Validate input
      staffSchema.parse(staff);
      
      if (!salonId) throw new Error('Salon not found');
      
      const { data, error } = await supabase
        .from('staff')
        .insert([{ ...staff, salon_id: salonId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({
        title: "Success",
        description: "Staff member added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add staff member",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Staff, 'id' | 'created_at' | 'updated_at'>> }) => {
      const { data: result, error } = await supabase
        .from('staff')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update staff member",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete staff member",
        variant: "destructive",
      });
    },
  });
}