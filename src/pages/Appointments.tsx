import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Plus, Search, Filter, Users, Phone } from "lucide-react";

export default function Appointments() {
  const [searchTerm, setSearchTerm] = useState("");

  const appointments = [
    {
      id: 1,
      time: "09:00 AM",
      customer: "Sarah Johnson",
      phone: "+1 (555) 123-4567",
      service: "Hair Styling & Color",
      staff: "Emma Wilson",
      status: "confirmed",
      duration: "2h",
      amount: "$180"
    },
    {
      id: 2,
      time: "10:30 AM",
      customer: "Michael Chen",
      phone: "+1 (555) 234-5678",
      service: "Haircut & Beard Trim",
      staff: "James Rodriguez",
      status: "in-progress",
      duration: "45m",
      amount: "$65"
    },
    {
      id: 3,
      time: "12:00 PM",
      customer: "Lisa Anderson",
      phone: "+1 (555) 345-6789",
      service: "Deluxe Facial",
      staff: "Maria Garcia",
      status: "pending",
      duration: "1h 30m",
      amount: "$120"
    },
    {
      id: 4,
      time: "02:30 PM",
      customer: "David Thompson",
      phone: "+1 (555) 456-7890",
      service: "Full Grooming Package",
      staff: "Emma Wilson",
      status: "confirmed",
      duration: "2h 30m",
      amount: "$220"
    },
    {
      id: 5,
      time: "04:00 PM",
      customer: "Rachel Williams",
      phone: "+1 (555) 567-8901",
      service: "Manicure & Pedicure",
      staff: "Sofia Chen",
      status: "confirmed",
      duration: "1h 15m",
      amount: "$85"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-success/10 text-success border-success/20";
      case "in-progress": return "bg-primary/10 text-primary border-primary/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "completed": return "bg-accent/10 text-accent-foreground border-accent/20";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Appointments
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your daily schedule and bookings
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="hover:bg-accent/50">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar View
          </Button>
          <Button className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="card-premium">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="hover:bg-accent/50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="hover:bg-accent/50">
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="card-premium hover:shadow-medium transition-smooth">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Time */}
                  <div className="text-center min-w-[80px]">
                    <div className="text-lg font-bold text-primary">{appointment.time}</div>
                    <div className="text-sm text-muted-foreground">{appointment.duration}</div>
                  </div>

                  {/* Customer Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.customer}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="w-3 h-3 mr-1" />
                          {appointment.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service & Staff */}
                  <div className="min-w-[200px]">
                    <div className="font-medium">{appointment.service}</div>
                    <div className="text-sm text-muted-foreground">with {appointment.staff}</div>
                  </div>

                  {/* Amount */}
                  <div className="text-right min-w-[80px]">
                    <div className="text-lg font-bold text-success">{appointment.amount}</div>
                  </div>

                  {/* Status */}
                  <div className="min-w-[120px] text-right">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.replace("-", " ")}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-6">
                  <Button variant="outline" size="sm" className="hover:bg-accent/50">
                    Edit
                  </Button>
                  {appointment.status === "confirmed" && (
                    <Button size="sm" className="bg-gradient-primary hover:bg-gradient-primary/90">
                      Check In
                    </Button>
                  )}
                  {appointment.status === "in-progress" && (
                    <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground">
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-premium text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">24</div>
            <div className="text-sm text-muted-foreground">Total Today</div>
          </CardContent>
        </Card>
        <Card className="card-premium text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">18</div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
          </CardContent>
        </Card>
        <Card className="card-premium text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">3</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card className="card-premium text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">1</div>
            <div className="text-sm text-muted-foreground">Cancelled</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}