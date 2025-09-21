import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Plus, Search, Clock, Users, Edit, UserCheck } from "lucide-react";
import { useAppointments, useCreateAppointment, useUpdateAppointment, useCheckInAppointment } from "@/hooks/useAppointments";
import { useCustomers } from "@/hooks/useCustomers";
import { useServices } from "@/hooks/useServices";
import { useStaff } from "@/hooks/useStaff";
import { formatCurrency } from "@/lib/currency";

export default function Appointments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    staff_id: '',
    service_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });

  const { data: appointments, isLoading } = useAppointments();
  const { data: customers } = useCustomers();
  const { data: services } = useServices();
  const { data: staff } = useStaff();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const checkInAppointment = useCheckInAppointment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedService = services?.find(s => s.id === formData.service_id);
    if (!selectedService) return;

    // Check if service is active
    if (selectedService.status === 'inactive') {
      alert('This service is not active and cannot be booked.');
      return;
    }

    await createAppointment.mutateAsync({
      ...formData,
      duration_minutes: selectedService.duration_minutes,
      total_amount: selectedService.price,
      status: 'scheduled'
    });
    
    setIsDialogOpen(false);
    setFormData({
      customer_id: '',
      staff_id: '',
      service_id: '',
      appointment_date: '',
      appointment_time: '',
      notes: ''
    });
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      customer_id: appointment.customer_id,
      staff_id: appointment.staff_id || '',
      service_id: appointment.service_id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      notes: appointment.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;

    const selectedService = services?.find(s => s.id === formData.service_id);
    if (!selectedService) return;

    await updateAppointment.mutateAsync({
      id: editingAppointment.id,
      data: {
        ...formData,
        duration_minutes: selectedService.duration_minutes,
        total_amount: selectedService.price,
      }
    });
    
    setIsEditDialogOpen(false);
    setEditingAppointment(null);
    setFormData({
      customer_id: '',
      staff_id: '',
      service_id: '',
      appointment_date: '',
      appointment_time: '',
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer_id">Customer</Label>
                <Select value={formData.customer_id} onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service_id">Service</Label>
                <Select value={formData.service_id} onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services?.map(service => (
                      <SelectItem key={service.id} value={service.id} disabled={service.status === 'inactive'}>
                        {service.name} - {formatCurrency(service.price)} ({service.duration_minutes}min)
                        {service.status === 'inactive' && ' (Inactive)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff_id">Staff Member</Label>
                <Select value={formData.staff_id || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, staff_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff?.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name} {member.last_name} - {member.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment_date">Date</Label>
                  <Input
                    id="appointment_date"
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment_time">Time</Label>
                  <Input
                    id="appointment_time"
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointment_time: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createAppointment.isPending}>
                {createAppointment.isPending ? "Booking..." : "Book Appointment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Appointment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
              <DialogDescription>
                Update the appointment details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_customer_id">Customer</Label>
                <Select value={formData.customer_id} onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_service_id">Service</Label>
                <Select value={formData.service_id} onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services?.map(service => (
                      <SelectItem key={service.id} value={service.id} disabled={service.status === 'inactive'}>
                        {service.name} - {formatCurrency(service.price)} ({service.duration_minutes}min)
                        {service.status === 'inactive' && ' (Inactive)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_staff_id">Staff Member</Label>
                <Select value={formData.staff_id || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, staff_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff?.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name} {member.last_name} - {member.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_appointment_date">Date</Label>
                  <Input
                    id="edit_appointment_date"
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_appointment_time">Time</Label>
                  <Input
                    id="edit_appointment_time"
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointment_time: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={updateAppointment.isPending}>
                {updateAppointment.isPending ? "Updating..." : "Update Appointment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            All Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : appointments && appointments.length > 0 ? (
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
                {appointments.map((appointment) => (
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
                          {appointment.duration_minutes} min
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
                          {appointment.appointment_time}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatCurrency(appointment.total_amount)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(appointment)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        {appointment.status === 'scheduled' || appointment.status === 'confirmed' ? (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleCheckIn(appointment.id)}
                            disabled={checkInAppointment.isPending}
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Check In
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No appointments found</h3>
              <p className="text-muted-foreground">Start by booking your first appointment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}