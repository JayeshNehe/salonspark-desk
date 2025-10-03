import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AppRole = 'admin' | 'manager' | 'staff' | 'user';

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

// Get user's salon ID
export function useUserSalonId() {
  return useQuery({
    queryKey: ['user-salon-id'],
    queryFn: async (): Promise<string | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('salon_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data?.id || null;
    },
  });
}

// Assign role to user (admin only)
export function useAssignRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, salonId, role }: { userId: string; salonId: string; role: AppRole }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, salon_id: salonId, role }])
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

  return useMutation({
    mutationFn: async (roleId: string) => {
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
