import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Clock,
  Plus,
  ArrowRight,
  Package,
  Users,
  IndianRupee,
  PlayCircle,
  CheckCircle,
  CalendarClock,
} from "lucide-react";
import { useDashboardStats } from '@/hooks/useReports';
import { useLowStockProducts } from '@/hooks/useProducts';
import { useTodaysAppointments, useCheckInAppointment, useCompleteAppointment } from '@/hooks/useAppointments';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: dashboardStats, isLoading: isStatsLoading } = useDashboardStats();
  const { data: lowStockProducts } = useLowStockProducts();
  const { data: todayAppointments, isLoading: isAppointmentsLoading } = useTodaysAppointments();
  const checkInMutation = useCheckInAppointment();
  const completeMutation = useCompleteAppointment();

  const stats = [
    {
      title: "Appointments (30 days)",
      value: isStatsLoading ? "..." : dashboardStats?.totalAppointments.toString() || "0",
      change: "Click to view all",
      changeType: "neutral" as const,
      icon: Calendar,
      variant: "primary" as const,
      linkTo: "/appointments",
    },
    {
      title: "Products Low Stock",
      value: lowStockProducts?.length.toString() || "0",
      change: "Need restocking",
      changeType: lowStockProducts && lowStockProducts.length > 0 ? "negative" as const : "neutral" as const,
      icon: Package,
      variant: "accent" as const,
      linkTo: "/inventory",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-success/10 text-success border-success/20";
      case "in_progress": return "bg-primary/10 text-primary border-primary/20";
      case "scheduled": return "bg-warning/10 text-warning border-warning/20";
      case "completed": return "bg-success/10 text-success border-success/20";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    return `${totalMinutes} min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening at your salon today.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-primary" asChild>
            <Link to="/appointments">
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <Card className="lg:col-span-2 card-premium">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Today's Appointments
            </CardTitle>
            <Button variant="ghost" size="sm" className="hover:bg-accent/50" asChild>
              <Link to="/appointments">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAppointmentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-16" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : todayAppointments && todayAppointments.length > 0 ? (
              [...todayAppointments]
                .sort((a, b) => {
                  const statusOrder: Record<string, number> = { 'in_progress': 0, 'scheduled': 1, 'confirmed': 2, 'completed': 3 };
                  return (statusOrder[a.status || 'scheduled'] || 4) - (statusOrder[b.status || 'scheduled'] || 4);
                })
                .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 hover:shadow-soft transition-smooth"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-[70px]">
                      <div className="text-sm font-semibold">{formatTime(appointment.start_time)}</div>
                      <div className="text-xs text-muted-foreground">{calculateDuration(appointment.start_time, appointment.end_time)}</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {appointment.customers?.first_name} {appointment.customers?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.services?.name || 'No service'} • {appointment.staff ? `${appointment.staff.first_name} ${appointment.staff.last_name}` : 'No staff assigned'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-primary border-primary/30 hover:bg-primary/10"
                        onClick={() => checkInMutation.mutate(appointment.id)}
                        disabled={checkInMutation.isPending}
                      >
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Check In
                      </Button>
                    )}
                    {appointment.status === 'in_progress' && (
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90 text-success-foreground"
                        onClick={() => completeMutation.mutate(appointment.id)}
                        disabled={completeMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground"
                        asChild
                      >
                        <Link to={`/appointments?reschedule=${appointment.id}`}>
                          <CalendarClock className="w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                    <Badge className={getStatusColor(appointment.status || 'scheduled')}>
                      {(appointment.status || 'scheduled').replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No appointments scheduled for today</p>
                <Button className="mt-3" variant="outline" asChild>
                  <Link to="/appointments">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule First Appointment
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-gradient-primary hover:bg-gradient-primary/90" asChild>
                <Link to="/appointments">
                  <Plus className="w-4 h-4 mr-2" />
                  Book Appointment
                </Link>
              </Button>
          <Button variant="outline" className="w-full justify-start hover:bg-accent/50" asChild>
            <Link to="/customers">
              <Users className="w-4 h-4 mr-2" />
              Add Customer
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start hover:bg-accent/50" asChild>
            <Link to="/billing">
              <IndianRupee className="w-4 h-4 mr-2" />
              Process Payment
            </Link>
          </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}