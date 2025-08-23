import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';

export interface DashboardStats {
  totalRevenue: number;
  totalAppointments: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  revenueGrowth: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  appointments: number;
}

export interface ServiceReport {
  service_name: string;
  total_bookings: number;
  total_revenue: number;
}

export interface StaffReport {
  staff_name: string;
  total_appointments: number;
  total_revenue: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date();
      const lastMonth = subDays(today, 30);
      
      // Get total revenue
      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('sale_date', format(lastMonth, 'yyyy-MM-dd'));
      
      const totalRevenue = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      
      // Get total appointments
      const { count: totalAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', format(lastMonth, 'yyyy-MM-dd'));
      
      // Get total customers
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });
      
      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      // Get low stock products
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .filter('stock_quantity', 'lt', 'min_stock_level');
      
      return {
        totalRevenue,
        totalAppointments: totalAppointments || 0,
        totalCustomers: totalCustomers || 0,
        totalProducts: totalProducts || 0,
        lowStockCount: lowStockCount || 0,
        revenueGrowth: 12.5, // Mock data for now
      };
    },
  });
}

export function useRevenueData() {
  return useQuery({
    queryKey: ['revenue-data'],
    queryFn: async (): Promise<RevenueData[]> => {
      const today = new Date();
      const thirtyDaysAgo = subDays(today, 30);
      
      const { data: salesData } = await supabase
        .from('sales')
        .select(`
          sale_date,
          total_amount
        `)
        .gte('sale_date', format(thirtyDaysAgo, 'yyyy-MM-dd'))
        .order('sale_date');
      
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select(`
          appointment_date
        `)
        .gte('appointment_date', format(thirtyDaysAgo, 'yyyy-MM-dd'))
        .order('appointment_date');
      
      // Group by date
      const revenueByDate: { [key: string]: { revenue: number; appointments: number } } = {};
      
      salesData?.forEach(sale => {
        const date = sale.sale_date?.split('T')[0] || '';
        if (!revenueByDate[date]) {
          revenueByDate[date] = { revenue: 0, appointments: 0 };
        }
        revenueByDate[date].revenue += Number(sale.total_amount);
      });
      
      appointmentData?.forEach(appointment => {
        const date = appointment.appointment_date;
        if (!revenueByDate[date]) {
          revenueByDate[date] = { revenue: 0, appointments: 0 };
        }
        revenueByDate[date].appointments += 1;
      });
      
      return Object.entries(revenueByDate).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        appointments: data.appointments,
      }));
    },
  });
}

export function useServiceReports() {
  return useQuery({
    queryKey: ['service-reports'],
    queryFn: async (): Promise<ServiceReport[]> => {
      const { data } = await supabase
        .from('appointments')
        .select(`
          services (name),
          total_amount
        `)
        .eq('status', 'completed');
      
      const serviceStats: { [key: string]: { bookings: number; revenue: number } } = {};
      
      data?.forEach(appointment => {
        const serviceName = appointment.services?.name || 'Unknown Service';
        if (!serviceStats[serviceName]) {
          serviceStats[serviceName] = { bookings: 0, revenue: 0 };
        }
        serviceStats[serviceName].bookings += 1;
        serviceStats[serviceName].revenue += Number(appointment.total_amount || 0);
      });
      
      return Object.entries(serviceStats).map(([service_name, stats]) => ({
        service_name,
        total_bookings: stats.bookings,
        total_revenue: stats.revenue,
      }));
    },
  });
}

export function useStaffReports() {
  return useQuery({
    queryKey: ['staff-reports'],
    queryFn: async (): Promise<StaffReport[]> => {
      const { data } = await supabase
        .from('appointments')
        .select(`
          staff (first_name, last_name),
          total_amount
        `)
        .eq('status', 'completed');
      
      const staffStats: { [key: string]: { appointments: number; revenue: number } } = {};
      
      data?.forEach(appointment => {
        const staffName = appointment.staff 
          ? `${appointment.staff.first_name} ${appointment.staff.last_name}`
          : 'Unassigned';
        if (!staffStats[staffName]) {
          staffStats[staffName] = { appointments: 0, revenue: 0 };
        }
        staffStats[staffName].appointments += 1;
        staffStats[staffName].revenue += Number(appointment.total_amount || 0);
      });
      
      return Object.entries(staffStats).map(([staff_name, stats]) => ({
        staff_name,
        total_appointments: stats.appointments,
        total_revenue: stats.revenue,
      }));
    },
  });
}