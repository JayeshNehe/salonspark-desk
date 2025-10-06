import { useState } from 'react';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value: string;
  onValueChange: (value: string) => void;
  disableFuture?: boolean;
  disablePast?: boolean;
}

export function DatePicker({ value, onValueChange, disableFuture = false, disablePast = true }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedDate = value ? new Date(value) : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onValueChange(date.toISOString().split('T')[0]);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => {
            const today = new Date(new Date().setHours(0, 0, 0, 0));
            if (disablePast && date < today) return true;
            if (disableFuture && date > today) return true;
            return false;
          }}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}