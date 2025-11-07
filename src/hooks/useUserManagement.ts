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
        .select('id, user_id, role, created_at')
        .eq('salon_id', salonId);

      if (error) throw error;

      // Map to include user_id as identifier (we'll show partial email or user_id)
      const usersWithRoles: UserWithRole[] = (userRoles || []).map(userRole => ({
        id: userRole.user_id,
        email: userRole.user_id === currentUser.id ? currentUser.email || 'Unknown' : `User ${userRole.user_id.substring(0, 8)}...`,
        created_at: userRole.created_at,
        role: userRole.role,
        role_id: userRole.id,
      }));

      return usersWithRoles;
    },
    enabled: !!salonId,
  });
}

// Create receptionist account
export function useCreateReceptionist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: salonId } = useUserSalonId();

  return useMutation({
    mutationFn: async ({ email, firstName, lastName, password }: CreateReceptionistData) => {
      if (!salonId) throw new Error('Salon not found');

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Assign receptionist role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: authData.user.id,
          salon_id: salonId,
          role: 'receptionist',
        }]);

      if (roleError) throw roleError;

      return {
        userId: authData.user.id,
        email,
        password,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
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
