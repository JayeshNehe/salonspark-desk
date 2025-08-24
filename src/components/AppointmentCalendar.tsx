import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppointments } from '@/hooks/useAppointments';
import { formatCurrency } from '@/lib/currency';
import { CalendarDays, Clock, User, Scissors } from 'lucide-react';
import { format } from 'date-fns';

export function AppointmentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { data: appointments = [], isLoading } = useAppointments();

  // Filter appointments for selected date
  const selectedDateAppointments = appointments.filter(apt => {
    if (!selectedDate) return false;
    const aptDate = new Date(apt.appointment_date);
    return aptDate.toDateString() === selectedDate.toDateString();
  });

  // Get dates that have appointments for calendar highlighting
  const appointmentDates = appointments.map(apt => new Date(apt.appointment_date));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Appointment Calendar
          </CardTitle>
          <CardDescription>
            Select a date to view scheduled appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasAppointment: appointmentDates
            }}
            modifiersStyles={{
              hasAppointment: { 
                backgroundColor: 'hsl(var(--primary))', 
                color: 'white',
                fontWeight: 'bold'
              }
            }}
          />
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span>Has appointments</span>
          </div>
        </CardContent>
      </Card>

      {/* Appointments for Selected Date */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, 'PPPP') : 'Select a date'}
          </CardTitle>
          <CardDescription>
            {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''} scheduled
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDateAppointments.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No appointments scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateAppointments
                .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                .map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{appointment.appointment_time}</span>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {appointment.customers?.first_name} {appointment.customers?.last_name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-muted-foreground" />
                      <span>{appointment.services?.name}</span>
                    </div>
                    
                    {appointment.staff && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>Staff: {appointment.staff.first_name} {appointment.staff.last_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-medium text-primary">
                        {formatCurrency(appointment.total_amount)}
                      </span>
                      <span className="text-muted-foreground">
                        {appointment.duration_minutes} mins
                      </span>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="mt-2 pt-2 border-t text-sm text-muted-foreground">
                      <span className="font-medium">Notes: </span>
                      {appointment.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}