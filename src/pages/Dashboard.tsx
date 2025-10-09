import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggerContainer, staggerItemVariants } from "@/components/animations/StaggerContainer";
import { motion } from "framer-motion";
import { 
  Calendar, 
  IndianRupee, 
  Clock,
  Plus,
  ArrowRight,
  Package,
  Users,
} from "lucide-react";
import { useDashboardData, useLowStockProducts } from '@/hooks/useApi';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardData();
  const { data: lowStockProducts } = useLowStockProducts();

  const stats = [
    {
      title: "Appointments Today",
      value: isDashboardLoading ? "..." : dashboardData?.todayAppointments.toString() || "0",
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

  const todayAppointments = [
    // Empty array for new salons - will be populated with real data
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-success/10 text-success border-success/20";
      case "in-progress": return "bg-primary/10 text-primary border-primary/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
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
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <motion.div key={index} variants={staggerItemVariants}>
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </StaggerContainer>

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
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 hover:shadow-soft transition-smooth"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm font-semibold">{appointment.time}</div>
                      <div className="text-xs text-muted-foreground">{appointment.duration}</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{appointment.customer}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.service} • {appointment.staff}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status.replace("-", " ")}
                  </Badge>
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