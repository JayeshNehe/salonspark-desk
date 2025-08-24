import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit3, Receipt, User, Scissors, Clock, Calendar } from 'lucide-react';
import { useUpdateAppointment } from '@/hooks/useAppointments';
import { formatCurrency } from '@/lib/currency';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentStatusDialogProps {
  appointment: {
    id: string;
    customer_id: string;
    service_id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    total_amount: number;
    duration_minutes: number;
    billing_generated: boolean;
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
  };
}

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'waiting', label: 'Waiting', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'no_show', label: 'No Show', color: 'bg-gray-100 text-gray-800 border-gray-200' }
];

export function AppointmentStatusDialog({ appointment }: AppointmentStatusDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(appointment.status);
  const navigate = useNavigate();
  const updateAppointment = useUpdateAppointment();

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleStatusUpdate = async () => {
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        status: newStatus as any
      });

      // If status is completed and billing not generated, create billing record
      if (newStatus === 'completed' && !appointment.billing_generated) {
        await generateBilling();
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  const generateBilling = async () => {
    try {
      // Create sale record
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: appointment.customer_id,
          appointment_id: appointment.id,
          subtotal: appointment.total_amount,
          tax_amount: 0,
          discount_amount: 0,
          total_amount: appointment.total_amount,
          payment_method: 'cash',
          payment_status: 'paid'
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale item
      await supabase
        .from('sale_items')
        .insert({
          sale_id: sale.id,
          service_id: appointment.service_id,
          quantity: 1,
          unit_price: appointment.services?.price || appointment.total_amount,
          total_price: appointment.total_amount
        });

      // Update appointment billing status
      await supabase
        .from('appointments')
        .update({
          billing_generated: true,
          billing_id: sale.id
        })
        .eq('id', appointment.id);

    } catch (error) {
      console.error('Failed to generate billing:', error);
    }
  };

  const handleViewBilling = () => {
    navigate('/billing', { 
      state: { 
        preloadedCustomer: {
          id: appointment.customer_id,
          name: `${appointment.customers?.first_name} ${appointment.customers?.last_name}`,
          phone: appointment.customers?.phone
        }
      }
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="hover:bg-accent/50">
          <Edit3 className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Appointment Status</DialogTitle>
          <DialogDescription>
            Update appointment status and manage billing
          </DialogDescription>
        </DialogHeader>

        {/* Appointment Details */}
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                {appointment.customers?.first_name} {appointment.customers?.last_name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-muted-foreground" />
              <span>{appointment.services?.name}</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{appointment.appointment_date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{appointment.appointment_time}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-primary">
                {formatCurrency(appointment.total_amount)}
              </span>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Status Update */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Update Status</label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={option.color} variant="outline">
                        {option.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Billing Section */}
          {(appointment.status === 'completed' || newStatus === 'completed') && (
            <>
              <Separator />
              <div className="space-y-3">
                <label className="text-sm font-medium">Billing</label>
                {appointment.billing_generated ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800">Billing generated</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleViewBilling}>
                      View Billing
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Receipt className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-800">Billing will be auto-generated when marked as completed</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStatusUpdate}
              disabled={updateAppointment.isPending}
              className="bg-gradient-primary hover:bg-gradient-primary/90"
            >
              {updateAppointment.isPending ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}