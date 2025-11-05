import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Plus, Search, Clock, Users, UserCheck } from "lucide-react";
import { useAppointments, useCreateAppointment, useUpdateAppointment, useCheckInAppointment } from "@/hooks/useAppointments";
import { useCustomers } from "@/hooks/useCustomers";
import { useServices } from "@/hooks/useServices";
import { useStaff } from "@/hooks/useStaff";
import { formatCurrency } from "@/lib/currency";
import { CustomerSearchCombobox } from "@/components/appointments/CustomerSearchCombobox";
import { DatePicker } from "@/components/appointments/DatePicker";
import { TimeSlotSelector } from "@/components/appointments/TimeSlotSelector";

export default function Appointments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [reschedulingAppointment, setReschedulingAppointment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    customer_id: '',
    staff_id: '',
    service_id: '',
    appointment_date: new Date().toISOString().split('T')[0], // Today's date
    start_time: '',
    notes: ''
  });

  const { data: appointments, isLoading } = useAppointments();
  const { data: customers } = useCustomers();
  const { data: services } = useServices();
  const { data: staff } = useStaff();
  
  // Sort services and staff alphabetically
  const sortedServices = useMemo(() => 
    services?.slice().sort((a, b) => a.name.localeCompare(b.name)) || [], 
    [services]
  );
  
  const sortedStaff = useMemo(() => 
    staff?.slice().sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)) || [], 
    [staff]
  );
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const checkInAppointment = useCheckInAppointment();
  
  // Get selected service for duration calculation
  const selectedService = sortedServices.find(s => s.id === formData.service_id);

  // Filter appointments based on search query
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    if (!searchQuery.trim()) return appointments;
    
    const query = searchQuery.toLowerCase();
    return appointments.filter(appointment => {
      const customerName = `${appointment.customers?.first_name || ''} ${appointment.customers?.last_name || ''}`.toLowerCase();
      const customerPhone = appointment.customers?.phone?.toLowerCase() || '';
      
      // Get customer details to search birthdate if available
      const customer = customers?.find(c => c.id === appointment.customer_id);
      const birthdate = customer?.birthday ? new Date(customer.birthday).toLocaleDateString() : '';
      
      return customerName.includes(query) || 
             customerPhone.includes(query) || 
             birthdate.includes(query);
    });
  }, [appointments, searchQuery, customers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    // Check if service is active
    if (selectedService.status === 'inactive') {
      alert('This service is not active and cannot be booked.');
      return;
    }

    // Calculate end time based on service duration
    const startDateTime = new Date(`${formData.appointment_date}T${formData.start_time}`);
    const endDateTime = new Date(startDateTime.getTime() + selectedService.duration_minutes * 60000);
    const endTime = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`;

    await createAppointment.mutateAsync({
      customer_id: formData.customer_id,
      service_id: formData.service_id,
      staff_id: formData.staff_id || undefined,
      appointment_date: formData.appointment_date,
      start_time: formData.start_time,
      end_time: endTime,
      notes: formData.notes || undefined,
      status: 'scheduled'
    });
    
    setIsDialogOpen(false);
    setFormData({
      customer_id: '',
      staff_id: '',
      service_id: '',
      appointment_date: new Date().toISOString().split('T')[0],
      start_time: '',
      notes: ''
    });
  };

  const handleReschedule = (appointment) => {
    setReschedulingAppointment(appointment);
    setFormData({
      customer_id: appointment.customer_id,
      staff_id: appointment.staff_id || '',
      service_id: appointment.service_id,
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      notes: appointment.notes || ''
    });
    setIsRescheduleDialogOpen(true);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAppointment) return;

    await updateAppointment.mutateAsync({
      id: reschedulingAppointment.id,
      data: {
        appointment_date: formData.appointment_date,
        start_time: formData.start_time,
      }
    });
    
    setIsRescheduleDialogOpen(false);
    setReschedulingAppointment(null);
    setFormData({
      customer_id: '',
      staff_id: '',
      service_id: '',
      appointment_date: '',
      start_time: '',
      notes: ''
    });
  };

  const handleCheckIn = async (appointmentId: string) => {
    await checkInAppointment.mutateAsync(appointmentId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Appointments
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your salon's appointments and schedule
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>
                Schedule a new appointment for your salon.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Customer</Label>
                  <CustomerSearchCombobox 
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service_id">Service</Label>
                  <Select value={formData.service_id} onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedServices.map(service => (
                        <SelectItem key={service.id} value={service.id} disabled={service.status === 'inactive'}>
                          {service.name} - {formatCurrency(service.price)} ({service.duration_minutes}min)
                          {service.status === 'inactive' && ' (Inactive)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff_id">Staff Member</Label>
                  <Select value={formData.staff_id || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, staff_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedStaff.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.first_name} {member.last_name} - {member.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Appointment Date</Label>
                  <DatePicker 
                    value={formData.appointment_date}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_date: value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Available Time Slots</Label>
                <TimeSlotSelector
                  selectedDate={formData.appointment_date}
                  serviceDuration={selectedService?.duration_minutes || 0}
                  selectedTime={formData.start_time}
                  onTimeSelect={(time) => setFormData(prev => ({ ...prev, start_time: time }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special requests or notes..."
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={createAppointment.isPending || !formData.customer_id || !formData.service_id || !formData.appointment_date || !formData.start_time}
              >
                {createAppointment.isPending ? "Booking..." : "Book Appointment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reschedule Appointment Dialog */}
        <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
              <DialogDescription>
                Update the appointment date and time.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reschedule_appointment_date">Date</Label>
                  <Input
                    id="reschedule_appointment_date"
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reschedule_start_time">Time</Label>
                  <Input
                    id="reschedule_start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={updateAppointment.isPending}>
                {updateAppointment.isPending ? "Rescheduling..." : "Reschedule Appointment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Custom Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by customer name, phone, or birthdate..."
            className="w-full pl-10 bg-muted/50 border-border/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              All Appointments
            </div>
            <Badge variant="secondary" className="ml-2">
              {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAppointments && filteredAppointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {appointment.customers?.first_name} {appointment.customers?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.customers?.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.services?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {appointment.services?.duration_minutes} min
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {appointment.staff?.first_name} {appointment.staff?.last_name || 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {new Date(appointment.appointment_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.start_time}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatCurrency(appointment.services?.price || 0)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {appointment.status === 'scheduled' || appointment.status === 'confirmed' ? (
                          <>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleCheckIn(appointment.id)}
                              disabled={checkInAppointment.isPending}
                            >
                              <UserCheck className="w-3 h-3 mr-1" />
                              Check In
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReschedule(appointment)}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Reschedule
                            </Button>
                          </>
                        ) : appointment.status === 'in_progress' ? (
                          <Badge variant="secondary">In Progress</Badge>
                        ) : appointment.status === 'completed' ? (
                          <Badge variant="default">Completed</Badge>
                        ) : (
                          <Badge variant="secondary">{appointment.status}</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">
                {searchQuery ? 'No appointments match your search' : 'No appointments found'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms.' : 'Start by booking your first appointment.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}