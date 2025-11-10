import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export type AppRole = 'admin' | 'manager' | 'staff' | 'user' | 'receptionist';

interface UserRole {
  id: string;
  user_id: string;
  salon_id: string;
  role: AppRole;
  created_at: string;
}

// Get current user's roles
export function useUserRoles() {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: async (): Promise<UserRole[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
  });
}

// Check if user has a specific role in their salon
export function useHasRole(requiredRole: AppRole) {
  const { data: roles } = useUserRoles();
  return roles?.some(role => role.role === requiredRole) || false;
}

// Get user's salon ID (works for both salon owners and staff/receptionists)
export function useUserSalonId() {
  return useQuery({
    queryKey: ['user-salon-id'],
    queryFn: async (): Promise<string | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // First, check if user owns a salon
      const { data: salonData, error: salonError } = await supabase
        .from('salon_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (salonError) throw salonError;
      if (salonData?.id) return salonData.id;

      // If not a salon owner, check if user has a role (receptionist/staff) in a salon
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('salon_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (roleError) throw roleError;
      return roleData?.salon_id || null;
    },
  });
}

// Assign role to user (admin only)
export function useAssignRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isAdmin = useHasRole('admin');

  return useMutation({
    mutationFn: async ({ userId, salonId, role }: { userId: string; salonId: string; role: AppRole }) => {
      // Client-side authorization check
      if (!isAdmin) {
        throw new Error('Unauthorized: Only admins can assign roles');
      }
      
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, salon_id: salonId, role: role as Database['public']['Enums']['app_role'] }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({
        title: "Success",
        description: "Role assigned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    },
  });
}

// Remove role from user (admin only)
export function useRemoveRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isAdmin = useHasRole('admin');

  return useMutation({
    mutationFn: async (roleId: string) => {
      // Client-side authorization check
      if (!isAdmin) {
        throw new Error('Unauthorized: Only admins can remove roles');
      }
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({
        title: "Success",
        description: "Role removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive",
      });
    },
  });
}
