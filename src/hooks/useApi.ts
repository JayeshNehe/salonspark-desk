// React Query hooks for API calls
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  clientsApi, 
  staffApi, 
  servicesApi, 
  productsApi, 
  appointmentsApi, 
  salesApi, 
  reportsApi,
  mockData 
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
    queryFn: () => query ? clientsApi.search(query) : Promise.resolve(mockData.clients),
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
    queryFn: () => Promise.resolve(mockData.staff),
    staleTime: 60000,
  });
}

// Services hooks
export function useServices(activeOnly = false) {
  return useQuery({
    queryKey: [...queryKeys.services, activeOnly],
    queryFn: () => Promise.resolve(mockData.services.filter(s => !activeOnly || s.active)),
    staleTime: 60000,
  });
}

// Products hooks
export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: () => Promise.resolve(mockData.products),
    staleTime: 60000,
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: [...queryKeys.products, 'lowstock'],
    queryFn: () => Promise.resolve(mockData.products.filter(p => p.stockQty <= p.reorderAt)),
    staleTime: 30000,
  });
}

// Appointments hooks
export function useAppointments(filters?: { from?: string; to?: string; staffId?: string }) {
  return useQuery({
    queryKey: [...queryKeys.appointments, filters],
    queryFn: () => appointmentsApi.getAll(filters),
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

// Mock data for dashboard KPIs
export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        todayRevenue: 2847,
        todayAppointments: 24,
        lowStockCount: 3,
        newCustomersThisMonth: 18,
        revenueData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 3000) + 1000,
        })),
        servicesMix: [
          { name: 'Hair Styling', count: 45, revenue: 3825 },
          { name: 'Facial Treatment', count: 32, revenue: 2080 },
          { name: 'Manicure', count: 28, revenue: 840 },
          { name: 'Hair Color', count: 24, revenue: 2400 },
          { name: 'Massage', count: 20, revenue: 1600 },
        ],
      };
    },
    staleTime: 60000, // 1 minute
  });
}