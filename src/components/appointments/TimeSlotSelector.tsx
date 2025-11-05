import { useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import { cn } from "@/lib/utils";

interface TimeSlotSelectorProps {
  selectedDate: string;
  serviceDuration: number;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

export function TimeSlotSelector({ 
  selectedDate, 
  serviceDuration, 
  selectedTime, 
  onTimeSelect 
}: TimeSlotSelectorProps) {
  const { data: appointments } = useAppointments();

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Generate time slots from 9 AM to 8 PM in 30-minute intervals
  const availableSlots = useMemo(() => {
    if (!selectedDate || !serviceDuration) return [];

    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 20; // 8 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if this slot conflicts with existing appointments
        const slotDateTime = new Date(`${selectedDate}T${timeString}`);
        const slotEndTime = new Date(slotDateTime.getTime() + serviceDuration * 60 * 1000);
        
        const hasConflict = appointments?.some(appointment => {
          if (appointment.appointment_date !== selectedDate) return false;
          if (appointment.status === 'cancelled') return false;
          
          const appointmentStart = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
          const appointmentEnd = new Date(`${appointment.appointment_date}T${appointment.end_time}`);
          
          // Check for overlap
          return (slotDateTime < appointmentEnd && slotEndTime > appointmentStart);
        });

        // Check if slot would extend beyond business hours
        const wouldExtendBeyond = slotEndTime.getHours() > endHour;
        
        slots.push({
          time: timeString,
          available: !hasConflict && !wouldExtendBeyond,
          displayTime: formatTimeDisplay(timeString)
        });
      }
    }
    
    return slots;
  }, [selectedDate, serviceDuration, appointments]);


  if (!selectedDate || !serviceDuration) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Select a date and service to see available time slots</p>
      </div>
    );
  }

  const availableCount = availableSlots.filter(slot => slot.available).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Available Time Slots</h4>
        <Badge variant="secondary">
          {availableCount} available
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
        {availableSlots.map((slot) => (
          <Button
            key={slot.time}
            variant={selectedTime === slot.time ? "default" : "outline"}
            size="sm"
            disabled={!slot.available}
            onClick={() => onTimeSelect(slot.time)}
            className={cn(
              "text-xs",
              !slot.available && "opacity-50 cursor-not-allowed"
            )}
          >
            {slot.displayTime}
          </Button>
        ))}
      </div>
      
      {availableCount === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No available slots for this date</p>
          <p className="text-xs mt-1">Try selecting a different date</p>
        </div>
      )}
    </div>
  );
}
