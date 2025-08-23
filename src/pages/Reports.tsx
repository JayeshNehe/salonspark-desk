import { useDashboardStats, useRevenueData, useServiceReports, useStaffReports } from '@/hooks/useReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Calendar, Package, AlertTriangle, IndianRupee } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export default function Reports() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData();
  const { data: serviceReports, isLoading: serviceLoading } = useServiceReports();
  const { data: staffReports, isLoading: staffLoading } = useStaffReports();

  const statsCards = [
    {
      title: "Total Revenue",
      value: stats ? formatCurrency(stats.totalRevenue) : "₹0",
      icon: IndianRupee,
      trend: stats?.revenueGrowth || 0,
      loading: statsLoading
    },
    {
      title: "Total Appointments",
      value: stats?.totalAppointments || 0,
      icon: Calendar,
      trend: 8.2,
      loading: statsLoading
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: Users,
      trend: 12.1,
      loading: statsLoading
    },
    {
      title: "Products in Stock",
      value: stats?.totalProducts || 0,
      icon: Package,
      trend: -2.5,
      loading: statsLoading
    }
  ];

  if (statsLoading && revenueLoading && serviceLoading && staffLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Business insights and performance metrics
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted"></CardHeader>
              <CardContent className="h-16 bg-muted"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Business insights and performance metrics
          </p>
        </div>
        
        {stats && stats.lowStockCount > 0 && (
          <Badge variant="destructive" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            {stats.lowStockCount} Low Stock Items
          </Badge>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.loading ? (
                  <div className="w-20 h-8 bg-muted animate-pulse rounded" />
                ) : (
                  card.value
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${
                  card.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {Math.abs(card.trend)}%
                </span>
                {' '}from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="services">Service Performance</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Appointments (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <div className="w-full h-80 bg-muted animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="right" dataKey="appointments" fill="#8884d8" />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {serviceLoading ? (
                  <div className="w-full h-60 bg-muted animate-pulse rounded" />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={serviceReports}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ service_name, total_bookings }) => `${service_name}: ${total_bookings}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total_bookings"
                      >
                        {serviceReports?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Services by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {serviceLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="w-32 h-4 bg-muted animate-pulse rounded" />
                        <div className="w-20 h-4 bg-muted animate-pulse rounded" />
                      </div>
                    ))
                  ) : (
                    serviceReports?.slice(0, 5).map((service, index) => (
                      <div key={service.service_name} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                          <span className="text-sm font-medium">{service.service_name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{formatCurrency(service.total_revenue)}</p>
                          <p className="text-xs text-muted-foreground">{service.total_bookings} bookings</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {staffLoading ? (
                <div className="w-full h-80 bg-muted animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={staffReports}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="staff_name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="total_revenue" fill="#8884d8" name="Revenue (₹)" />
                    <Bar yAxisId="right" dataKey="total_appointments" fill="#82ca9d" name="Appointments" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {staffLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-16 bg-muted"></CardHeader>
                  <CardContent className="h-20 bg-muted"></CardContent>
                </Card>
              ))
            ) : (
              staffReports?.map((staff, index) => (
                <Card key={staff.staff_name}>
                  <CardHeader>
                    <CardTitle className="text-lg">{staff.staff_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Appointments:</span>
                        <span className="font-semibold">{staff.total_appointments}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Revenue:</span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(staff.total_revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg. per Appointment:</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            staff.total_appointments > 0 
                              ? staff.total_revenue / staff.total_appointments 
                              : 0
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}