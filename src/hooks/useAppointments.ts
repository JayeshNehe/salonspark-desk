import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserSalonId } from './useUserRoles';
import { appointmentSchema } from '@/lib/validations';

interface Appointment {
  id: string;
  customer_id: string;
  staff_id?: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customers?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  services?: {
    name: string;
    price: number;
    duration_minutes: number;
  };
  staff?: {
    first_name: string;
    last_name: string;
  };
}

export function useAppointments() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async (): Promise<Appointment[]> => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone
          ),
          services (
            name,
            price,
            duration_minutes
          ),
          staff (
            first_name,
            last_name
          )
        `)
        .order('appointment_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useTodaysAppointments() {
  return useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: async (): Promise<Appointment[]> => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone
          ),
          services (
            name,
            price,
            duration_minutes
          ),
          staff (
            first_name,
            last_name
          )
        `)
        .eq('appointment_date', today)
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: salonId } = useUserSalonId();

  return useMutation({
    mutationFn: async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'customers' | 'services' | 'staff'>) => {
      // Validate input
      appointmentSchema.parse(appointment);
      
      if (!salonId) throw new Error('Salon not found');
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([{ ...appointment, salon_id: salonId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create appointment",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'customers' | 'services' | 'staff'>> }) => {
      const { data: result, error } = await supabase
        .from('appointments')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone
          ),
          services (
            name,
            price
          ),
          staff (
            first_name,
            last_name
          )
        `)
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update appointment",
        variant: "destructive",
      });
    },
  });
}

export function useCheckInAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: salonId } = useUserSalonId();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!salonId) throw new Error('Salon not found');
      
      // Get appointment details
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (appointmentError) throw appointmentError;

      // Get service duration for scheduling auto-complete
      const { data: service } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', appointment.service_id)
        .single();

      const durationMinutes = service?.duration_minutes || 30;

      // Update appointment status to in_progress
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          status: 'in_progress'
        })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      // Schedule automatic status update to completed
      setTimeout(async () => {
        await supabase
          .from('appointments')
          .update({ status: 'completed' })
          .eq('id', appointmentId)
          .eq('status', 'in_progress'); // Only update if still in progress
        
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
        queryClient.invalidateQueries({ queryKey: ['pending-billings'] });
      }, durationMinutes * 60 * 1000);

      return { appointment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] }); 
      toast({
        title: "Success",
        description: "Customer checked in and billing created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to check in appointment",
        variant: "destructive",
      });
    },
  });
}