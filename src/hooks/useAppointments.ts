import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  customer_id: string;
  staff_id?: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  total_amount: number;
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
            price
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

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'customers' | 'services' | 'staff'>) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
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

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      // First get the appointment details
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name
          ),
          services (
            id,
            name,
            price
          )
        `)
        .eq('id', appointmentId)
        .single();

      if (appointmentError) throw appointmentError;

      // Update appointment status to in_progress
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'in_progress' })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      // Create a sale record for billing
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          customer_id: appointment.customer_id,
          appointment_id: appointmentId,
          staff_id: appointment.staff_id,
          subtotal: appointment.total_amount,
          tax_amount: 0,
          discount_amount: 0,
          total_amount: appointment.total_amount,
          payment_method: 'cash',
          payment_status: 'pending',
          sale_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale item for the service
      const { error: saleItemError } = await supabase
        .from('sale_items')
        .insert([{
          sale_id: sale.id,
          service_id: appointment.service_id,
          quantity: 1,
          unit_price: appointment.services.price,
          total_price: appointment.services.price
        }]);

      if (saleItemError) throw saleItemError;

      return { appointment, sale };
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