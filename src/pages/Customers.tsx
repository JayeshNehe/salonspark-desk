import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Filter, Phone, Mail, Calendar, Star } from "lucide-react";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");

  const customers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      lastVisit: "2024-01-15",
      totalVisits: 24,
      totalSpent: "$2,340",
      favoriteService: "Hair Styling",
      rating: 5,
      status: "VIP",
      notes: "Prefers Emma as stylist, allergic to certain hair dyes"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1 (555) 234-5678",
      lastVisit: "2024-01-12",
      totalVisits: 18,
      totalSpent: "$1,890",
      favoriteService: "Haircut",
      rating: 4,
      status: "Regular",
      notes: "Prefers short styles, monthly appointments"
    },
    {
      id: 3,
      name: "Lisa Anderson",
      email: "lisa.anderson@email.com",
      phone: "+1 (555) 345-6789",
      lastVisit: "2024-01-10",
      totalVisits: 32,
      totalSpent: "$3,120",
      favoriteService: "Facial Treatment",
      rating: 5,
      status: "VIP",
      notes: "Sensitive skin, prefers organic products"
    },
    {
      id: 4,
      name: "David Thompson",
      email: "david.thompson@email.com",
      phone: "+1 (555) 456-7890",
      lastVisit: "2024-01-08",
      totalVisits: 12,
      totalSpent: "$1,450",
      favoriteService: "Full Service",
      rating: 4,
      status: "Regular",
      notes: "Books quarterly appointments, travels frequently"
    },
    {
      id: 5,
      name: "Rachel Williams",
      email: "rachel.williams@email.com",
      phone: "+1 (555) 567-8901",
      lastVisit: "2024-01-14",
      totalVisits: 15,
      totalSpent: "$1,275",
      favoriteService: "Manicure",
      rating: 5,
      status: "Regular",
      notes: "Weekly nail appointments, prefers gel polish"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VIP": return "bg-secondary-dark/10 text-secondary-dark border-secondary-dark/20";
      case "Regular": return "bg-primary/10 text-primary border-primary/20";
      case "New": return "bg-accent/10 text-accent-foreground border-accent/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-secondary-dark fill-current" : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Customers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer database and relationships
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="hover:bg-accent/50">
            <Filter className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="card-premium">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, phone, or email..."
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
              VIP Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <div className="grid gap-4">
        {customers.map((customer) => (
          <Card key={customer.id} className="card-premium hover:shadow-medium transition-smooth">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Avatar */}
                  <Avatar className="w-16 h-16 border-2 border-primary/20">
                    <AvatarImage src={`/placeholder-avatar-${customer.id}.jpg`} alt={customer.name} />
                    <AvatarFallback className="bg-gradient-secondary text-secondary-foreground text-lg font-semibold">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  {/* Customer Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold">{customer.name}</h3>
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                      <div className="flex items-center">
                        {getRatingStars(customer.rating)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {customer.email}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last visit: {new Date(customer.lastVisit).toLocaleDateString()}
                      </div>
                      <div>
                        Favorite: {customer.favoriteService}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-center min-w-[100px]">
                    <div className="text-2xl font-bold text-primary">{customer.totalVisits}</div>
                    <div className="text-sm text-muted-foreground">Visits</div>
                  </div>

                  <div className="text-center min-w-[100px]">
                    <div className="text-2xl font-bold text-success">{customer.totalSpent}</div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-6">
                  <Button variant="outline" size="sm" className="hover:bg-accent/50">
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="hover:bg-accent/50">
                    Edit
                  </Button>
                  <Button size="sm" className="bg-gradient-primary hover:bg-gradient-primary/90">
                    Book
                  </Button>
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground italic">
                    <strong>Notes:</strong> {customer.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-premium text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">1,247</div>
            <div className="text-sm text-muted-foreground">Total Customers</div>
          </CardContent>
        </Card>
        <Card className="card-premium text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-secondary-dark">89</div>
            <div className="text-sm text-muted-foreground">VIP Customers</div>
          </CardContent>
        </Card>
        <Card className="card-premium text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">$47,285</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </CardContent>
        </Card>
        <Card className="card-premium text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-accent-foreground">4.8</div>
            <div className="text-sm text-muted-foreground">Avg. Rating</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}