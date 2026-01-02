import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserSalonId } from './useUserRoles';

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: string;
  role_id: string;
}

interface CreateReceptionistData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

// Generate a random secure password
export function generatePassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Fetch all users with roles in the salon
export function useUsersWithRoles() {
  const { data: salonId } = useUserSalonId();

  return useQuery({
    queryKey: ['users-with-roles', salonId],
    queryFn: async (): Promise<UserWithRole[]> => {
      if (!salonId) return [];

      // Get current user to check if they're admin
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return [];

      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('id, user_id, role, created_at, email')
        .eq('salon_id', salonId);

      if (error) throw error;

      // Map to include email from the stored column
      const usersWithRoles: UserWithRole[] = (userRoles || []).map(userRole => ({
        id: userRole.user_id,
        email: userRole.email || (userRole.user_id === currentUser.id ? currentUser.email || 'Unknown' : `User ${userRole.user_id.substring(0, 8)}...`),
        created_at: userRole.created_at,
        role: userRole.role,
        role_id: userRole.id,
      }));

      return usersWithRoles;
    },
    enabled: !!salonId,
  });
}

// Check if salon already has a receptionist
export function useSalonHasReceptionist() {
  const { data: salonId } = useUserSalonId();

  return useQuery({
    queryKey: ['salon-has-receptionist', salonId],
    queryFn: async (): Promise<boolean> => {
      if (!salonId) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('salon_id', salonId)
        .eq('role', 'receptionist')
        .limit(1);

      if (error) throw error;
      return (data?.length ?? 0) > 0;
    },
    enabled: !!salonId,
  });
}

// Create receptionist account using edge function (doesn't sign out admin)
export function useCreateReceptionist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: salonId } = useUserSalonId();

  return useMutation({
    mutationFn: async ({ email, firstName, lastName, password }: CreateReceptionistData) => {
      if (!salonId) throw new Error('Salon not found');

      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Call edge function to create receptionist (uses admin API, doesn't affect current session)
      const { data, error } = await supabase.functions.invoke('create-receptionist', {
        body: {
          email,
          password,
          firstName,
          lastName,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to create receptionist');

      return {
        userId: data.userId,
        email,
        password,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['salon-has-receptionist'] });
      toast({
        title: "Success",
        description: "Receptionist account created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create receptionist account",
        variant: "destructive",
      });
    },
  });
}

// Delete user role
export function useDeleteUserRole() {
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
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['salon-has-receptionist'] });
      toast({
        title: "Success",
        description: "User role removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove user role",
        variant: "destructive",
      });
    },
  });
}
