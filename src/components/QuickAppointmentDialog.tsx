import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { useStaff } from '@/hooks/useStaff';
import { CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickAppointmentDialogProps {
  customerId: string;
  customerName: string;
  trigger?: React.ReactNode;
}

export function QuickAppointmentDialog({ customerId, customerName, trigger }: QuickAppointmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    service_id: '',
    staff_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });

  const { toast } = useToast();
  const createAppointment = useCreateAppointment();
  const { data: services = [] } = useServices();
  const { data: staff = [] } = useStaff();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedService = services.find(s => s.id === formData.service_id);
    if (!selectedService) {
      toast({
        title: "Error",
        description: "Please select a service",
        variant: "destructive"
      });
      return;
    }

    try {
      await createAppointment.mutateAsync({
        customer_id: customerId,
        service_id: formData.service_id,
        staff_id: formData.staff_id || null,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        duration_minutes: selectedService.duration_minutes,
        status: 'scheduled',
        notes: formData.notes,
        total_amount: selectedService.price
      });

      setIsOpen(false);
      setFormData({
        service_id: '',
        staff_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: ''
      });
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="bg-gradient-primary hover:bg-gradient-primary/90">
            <CalendarDays className="w-4 h-4 mr-2" />
            Quick Book
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Appointment Booking</DialogTitle>
          <DialogDescription>
            Book an appointment for {customerName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service">Service *</Label>
            <Select value={formData.service_id} onValueChange={(value) => handleInputChange('service_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - ₹{service.price} ({service.duration_minutes}min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff">Staff (Optional)</Label>
            <Select value={formData.staff_id} onValueChange={(value) => handleInputChange('staff_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                type="date"
                value={formData.appointment_date}
                onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                type="time"
                value={formData.appointment_time}
                onChange={(e) => handleInputChange('appointment_time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-primary hover:bg-gradient-primary/90"
              disabled={createAppointment.isPending}
            >
              {createAppointment.isPending ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}