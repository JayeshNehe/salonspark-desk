import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Sale {
  id: string;
  customer_id?: string;
  staff_id?: string;
  appointment_id?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'upi' | 'wallet';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  sale_date: string;
  created_at: string;
  updated_at: string;
  customers?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  sale_items?: {
    id: string;
    service_id?: string;
    product_id?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    services?: { name: string };
    products?: { name: string };
  }[];
}

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async (): Promise<Sale[]> => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone
          ),
          sale_items (
            id,
            service_id,
            product_id,
            quantity,
            unit_price,
            total_price,
            services (name),
            products (name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (saleData: {
      customer_id?: string;
      subtotal: number;
      tax_amount: number;
      discount_amount: number;
      total_amount: number;
      payment_method: 'cash' | 'card' | 'upi';
      items: Array<{
        service_id?: string;
        product_id?: string;
        quantity: number;
        unit_price: number;
        total_price: number;
      }>;
    }) => {
      // Create the sale record
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          customer_id: saleData.customer_id,
          subtotal: saleData.subtotal,
          tax_amount: saleData.tax_amount,
          discount_amount: saleData.discount_amount,
          total_amount: saleData.total_amount,
          payment_method: saleData.payment_method,
          payment_status: 'paid'
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = saleData.items.map(item => ({
        sale_id: sale.id,
        ...item
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: "Success",
        description: "Sale created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create sale",
        variant: "destructive",
      });
    },
  });
}

export function useTodaysSales() {
  return useQuery({
    queryKey: ['sales', 'today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('sale_date', today)
        .eq('payment_status', 'paid');
      
      if (error) throw error;
      
      return {
        totalRevenue: data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0,
        totalSales: data?.length || 0
      };
    },
    staleTime: 60000, // 1 minute
  });
}