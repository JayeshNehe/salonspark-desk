// React Query hooks for API calls
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  clientsApi, 
  staffApi, 
  servicesApi, 
  productsApi, 
  appointmentsApi, 
  salesApi, 
  reportsApi
} from '@/services/api';
import { Client, Staff, Service, Product, Appointment } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Query keys
export const queryKeys = {
  clients: ['clients'],
  staff: ['staff'],
  services: ['services'],
  products: ['products'],
  appointments: ['appointments'],
  reports: ['reports'],
} as const;

// Clients hooks
export function useClients(query?: string) {
  return useQuery({
    queryKey: [...queryKeys.clients, query],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      let queryBuilder = supabase.from('customers').select('*');
      
      if (query) {
        queryBuilder = queryBuilder.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);
      }
      
      const { data, error } = await queryBuilder;
      if (error) throw error;
      
      return data?.map(customer => ({
        id: customer.id,
        name: `${customer.first_name} ${customer.last_name}`,
        phone: customer.phone,
        email: customer.email || '',
        gender: 'other' as const,
        allergies: '',
        notes: customer.notes || '',
        tags: [],
        createdAt: new Date(customer.created_at || ''),
        appointments: [],
        sales: [],
      })) || [];
    },
    staleTime: 30000,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: [...queryKeys.clients, id],
    queryFn: () => clientsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Client>) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      toast({
        title: "Success",
        description: "Client created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => 
      clientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Staff hooks
export function useStaff() {
  return useQuery({
    queryKey: queryKeys.staff,
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.from('staff').select('*');
      if (error) throw error;
      
      return data?.map(staff => ({
        id: staff.id,
        name: `${staff.first_name} ${staff.last_name}`,
        role: staff.role as 'stylist' | 'beautician' | 'manager',
        commissionPct: Number(staff.commission_rate) || 0,
        active: staff.status === 'active',
        appointments: [],
      })) || [];
    },
    staleTime: 60000,
  });
}

// Services hooks
export function useServices(activeOnly = false) {
  return useQuery({
    queryKey: [...queryKeys.services, activeOnly],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      let queryBuilder = supabase.from('services').select('*');
      
      if (activeOnly) {
        queryBuilder = queryBuilder.eq('status', 'active');
      }
      
      const { data, error } = await queryBuilder;
      if (error) throw error;
      
      return data?.map(service => ({
        id: service.id,
        name: service.name,
        category: service.category_id || 'General',
        durationM: service.duration_minutes,
        price: Number(service.price),
        taxPct: 8,
        active: service.status === 'active',
        appointments: [],
      })) || [];
    },
    staleTime: 60000,
  });
}

// Products hooks
export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      
      return data?.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku || '',
        category: product.category || 'General',
        price: Number(product.selling_price),
        cost: Number(product.cost_price),
        stockQty: product.stock_quantity,
        reorderAt: product.min_stock_level || 10,
        expiryAt: new Date(),
      })) || [];
    },
    staleTime: 60000,
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: [...queryKeys.products, 'lowstock'],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      
      // Filter low stock products in JavaScript
      return data?.filter(product => product.stock_quantity <= (product.min_stock_level || 10))
        .map(product => ({
          id: product.id,
          name: product.name,
          sku: product.sku || '',
          category: product.category || 'General',
          price: Number(product.selling_price),
          cost: Number(product.cost_price),
          stockQty: product.stock_quantity,
          reorderAt: product.min_stock_level || 10,
          expiryAt: new Date(),
        })) || [];
    },
    staleTime: 30000,
  });
}

// Appointments hooks
export function useAppointments(filters?: { from?: string; to?: string; staffId?: string }) {
  return useQuery({
    queryKey: [...queryKeys.appointments, filters],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      let queryBuilder = supabase.from('appointments').select('*');
      
      if (filters?.from) {
        queryBuilder = queryBuilder.gte('appointment_date', filters.from);
      }
      if (filters?.to) {
        queryBuilder = queryBuilder.lte('appointment_date', filters.to);
      }
      if (filters?.staffId) {
        queryBuilder = queryBuilder.eq('staff_id', filters.staffId);
      }
      
      const { data, error } = await queryBuilder;
      if (error) throw error;
      
      return data?.map(appointment => ({
        id: appointment.id,
        customerId: appointment.customer_id,
        customerName: 'Customer',
        staffId: appointment.staff_id,
        staffName: 'Staff',
        serviceId: appointment.service_id,
        serviceName: 'Service',
        date: appointment.appointment_date,
        time: appointment.start_time,
        duration: 60,
        status: appointment.status as 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show',
        totalAmount: 0,
        notes: appointment.notes || '',
      })) || [];
    },
    staleTime: 30000,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Appointment>) => appointmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Appointment['status'] }) => 
      appointmentsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
      toast({
        title: "Success",
        description: "Appointment status updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Reports hooks
export function useDailyReport(date: string) {
  return useQuery({
    queryKey: [...queryKeys.reports, 'daily', date],
    queryFn: () => reportsApi.daily(date),
    staleTime: 300000, // 5 minutes
  });
}

export function useMonthlyReport(month: string) {
  return useQuery({
    queryKey: [...queryKeys.reports, 'monthly', month],
    queryFn: () => reportsApi.monthly(month),
    staleTime: 300000, // 5 minutes
  });
}

// Dashboard data hook - using real data instead of mock
export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Get today's date for filtering
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);
      
      // Fetch today's appointments
      const { data: todayAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', today);
      
      // Fetch this month's customers
      const { data: thisMonthCustomers } = await supabase
        .from('customers')
        .select('*')
        .gte('created_at', `${thisMonth}-01`);
        
      // Fetch sales data for revenue
      const { data: sales } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', today);
        
      // Calculate revenue
      const todayRevenue = sales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      
      return {
        todayRevenue,
        todayAppointments: todayAppointments?.length || 0,
        lowStockCount: 0, // Will be updated by the useLowStockProducts hook
        newCustomersThisMonth: thisMonthCustomers?.length || 0,
        revenueData: [], // Empty for new salons
        servicesMix: [], // Empty for new salons
      };
    },
    staleTime: 60000, // 1 minute
  });
}