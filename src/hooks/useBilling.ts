import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserSalonId } from './useUserRoles';

interface PendingBilling {
  appointment_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  service_id: string;
  service_name: string;
  service_price: number;
  staff_id?: string;
  sale_id?: string;
  appointment_date: string;
  start_time: string;
}

interface HeldTransaction {
  id: string;
  customer_id: string;
  customer_name: string;
  items: any[];
  subtotal: number;
  discount_amount: number;
  payment_method: string;
  created_at: string;
}

// Get appointments that are completed and ready for billing
export function usePendingBillings() {
  const { data: salonId } = useUserSalonId();
  
  return useQuery({
    queryKey: ['pending-billings', salonId],
    queryFn: async (): Promise<PendingBilling[]> => {
      if (!salonId) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          customer_id,
          service_id,
          staff_id,
          appointment_date,
          start_time,
          customers (
            first_name,
            last_name,
            phone
          ),
          services (
            name,
            price
          )
        `)
        .eq('salon_id', salonId)
        .eq('status', 'completed')
        .order('appointment_date', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((apt: any) => ({
        appointment_id: apt.id,
        customer_id: apt.customer_id,
        customer_name: `${apt.customers.first_name} ${apt.customers.last_name}`,
        customer_phone: apt.customers.phone,
        service_id: apt.service_id,
        service_name: apt.services.name,
        service_price: apt.services.price,
        staff_id: apt.staff_id,
        appointment_date: apt.appointment_date,
        start_time: apt.start_time
      }));
    },
    enabled: !!salonId,
  });
}

// Get held transactions
export function useHeldTransactions() {
  const { data: salonId } = useUserSalonId();
  
  return useQuery({
    queryKey: ['held-transactions', salonId],
    queryFn: async (): Promise<HeldTransaction[]> => {
      if (!salonId) return [];
      
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          customer_id,
          subtotal,
          discount,
          payment_method,
          created_at,
          customers (
            first_name,
            last_name
          ),
          sale_items (
            service_id,
            product_id,
            quantity,
            unit_price,
            total_price,
            services (
              name
            ),
            products (
              name
            )
          )
        `)
        .eq('salon_id', salonId)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((sale: any) => ({
        id: sale.id,
        customer_id: sale.customer_id,
        customer_name: `${sale.customers?.first_name || ''} ${sale.customers?.last_name || ''}`.trim() || 'Walk-in Customer',
        items: sale.sale_items.map((item: any) => ({
          id: item.service_id || item.product_id,
          name: item.services?.name || item.products?.name,
          type: item.service_id ? 'service' : 'product',
          price: item.unit_price,
          quantity: item.quantity
        })),
        subtotal: sale.subtotal,
        discount_amount: sale.discount,
        payment_method: sale.payment_method,
        created_at: sale.created_at
      }));
    },
    enabled: !!salonId,
  });
}

// Delete a held transaction (for resume functionality)
export function useDeleteHeldTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (saleId: string) => {
      // First delete sale items
      const { error: itemsError } = await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', saleId);

      if (itemsError) throw itemsError;

      // Then delete the sale
      const { error: saleError } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (saleError) throw saleError;

      return saleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['held-transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete held transaction",
        variant: "destructive",
      });
    },
  });
}

// Hold a transaction
export function useHoldTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: salonId } = useUserSalonId();

  return useMutation({
    mutationFn: async ({ 
      customerId, 
      cart, 
      subtotal, 
      discountAmount, 
      paymentMethod 
    }: { 
      customerId: string | null; 
      cart: any[]; 
      subtotal: number; 
      discountAmount: number; 
      paymentMethod: string;
    }) => {
      if (!salonId) throw new Error('Salon not found');
      
      // Create sale with pending status
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: customerId || undefined,
          salon_id: salonId,
          subtotal,
          discount: discountAmount,
          tax: 0,
          total: subtotal - discountAmount,
          payment_method: paymentMethod as any,
          payment_status: 'pending' as any
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        service_id: item.type === 'service' ? item.id : null,
        product_id: item.type === 'product' ? item.id : null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['held-transactions'] });
      toast({
        title: "Transaction Held",
        description: "Transaction has been held successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to hold transaction",
        variant: "destructive",
      });
    },
  });
}

// Complete a held transaction
export function useCompleteHeldTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      saleId, 
      paymentMethod,
      discountAmount,
      appointmentId 
    }: { 
      saleId: string; 
      paymentMethod: string;
      discountAmount: number;
      appointmentId?: string;
    }) => {
      // Get current sale to recalculate total
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select('subtotal')
        .eq('id', saleId)
        .single();

      if (saleError) throw saleError;

      const total = sale.subtotal - discountAmount;

      // Update sale to completed
      const { error: updateError } = await supabase
        .from('sales')
        .update({
          payment_status: 'completed' as any,
          payment_method: paymentMethod as any,
          discount: discountAmount,
          total: total
        })
        .eq('id', saleId);

      if (updateError) throw updateError;

      // Update product stock
      const { data: saleItems } = await supabase
        .from('sale_items')
        .select('product_id, quantity')
        .eq('sale_id', saleId)
        .not('product_id', 'is', null);

      if (saleItems) {
        for (const item of saleItems) {
          const { data: currentProduct } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();
            
          if (currentProduct) {
            await supabase
              .from('products')
              .update({ 
                stock_quantity: Math.max(0, currentProduct.stock_quantity - item.quantity)
              })
              .eq('id', item.product_id);
          }
        }
      }

      return saleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['held-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['pending-billings'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: "Payment Processed",
        description: "Payment has been completed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete transaction",
        variant: "destructive",
      });
    },
  });
}
