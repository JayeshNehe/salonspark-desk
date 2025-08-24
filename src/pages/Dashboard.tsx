import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  Star,
  Plus,
  ArrowRight,
  Package,
  UserPlus
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useDashboardData, useLowStockProducts } from '@/hooks/useApi';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/currency';

export default function Dashboard() {
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardData();
  const { data: lowStockProducts } = useLowStockProducts();

  const stats = [
    {
      title: "Today's Revenue",
      value: isDashboardLoading ? "..." : formatCurrency(dashboardData?.todayRevenue || 0),
      change: "+12.5% from yesterday",
      changeType: "positive" as const,
      icon: DollarSign,
      variant: "primary" as const,
    },
    {
      title: "Appointments Today",
      value: isDashboardLoading ? "..." : dashboardData?.todayAppointments.toString() || "0",
      change: "3 pending confirmations",
      changeType: "neutral" as const,
      icon: Calendar,
      variant: "secondary" as const,
    },
    {
      title: "Products Low Stock",
      value: lowStockProducts?.length.toString() || "0",
      change: "Need restocking",
      changeType: lowStockProducts && lowStockProducts.length > 0 ? "negative" as const : "neutral" as const,
      icon: Package,
      variant: "accent" as const,
    },
    {
      title: "New Customers This Month",
      value: isDashboardLoading ? "..." : dashboardData?.newCustomersThisMonth.toString() || "0",
      change: "vs last month",
      changeType: "positive" as const,
      icon: UserPlus,
      variant: "default" as const,
    },
  ];

  const todayAppointments = [
    {
      id: 1,
      time: "09:00 AM",
      customer: "Sarah Johnson",
      service: "Hair Styling",
      staff: "Emma Wilson",
      status: "confirmed",
      duration: "1h 30m"
    },
    {
      id: 2,
      time: "10:30 AM",
      customer: "Michael Chen",
      service: "Haircut & Beard Trim",
      staff: "James Rodriguez",
      status: "in-progress",
      duration: "45m"
    },
    {
      id: 3,
      time: "12:00 PM",
      customer: "Lisa Anderson",
      service: "Facial Treatment",
      staff: "Maria Garcia",
      status: "pending",
      duration: "1h"
    },
    {
      id: 4,
      time: "02:30 PM",
      customer: "David Thompson",
      service: "Full Service",
      staff: "Emma Wilson",
      status: "confirmed",
      duration: "2h"
    },
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
          <Button variant="outline" className="hover:bg-accent/50" asChild>
            <Link to="/appointments">
              <Calendar className="w-4 w-4 mr-2" />
              View Calendar
            </Link>
          </Button>
          <Button className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-primary" asChild>
            <Link to="/appointments">
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Revenue Last 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dashboardData?.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    className="text-xs"
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    className="text-xs"
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Service Mix Chart */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-secondary-dark" />
              Top Services (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dashboardData?.servicesMix}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'count' ? `${value} bookings` : formatCurrency(Number(value)), 
                      name === 'count' ? 'Bookings' : 'Revenue'
                    ]}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
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
            {todayAppointments.map((appointment) => (
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
            ))}
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
              <DollarSign className="w-4 h-4 mr-2" />
              Process Payment
            </Link>
          </Button>
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-secondary-dark" />
                Popular Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData?.servicesMix.slice(0, 4).map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{service.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {service.count} bookings
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-success">
                    {formatCurrency(service.revenue)}
                  </div>
                </div>
              )) || (
                Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}