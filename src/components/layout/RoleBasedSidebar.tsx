import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  Scissors, 
  CreditCard,
  BarChart3,
  Settings,
  UserCheck,
  Package,
  Home,
  Menu,
  X
} from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";

// Admin navigation
const adminNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Staff", href: "/staff", icon: UserCheck },
  { name: "Services", href: "/services", icon: Scissors },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Receptionist navigation
const receptionistNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Billing", href: "/billing", icon: CreditCard },
];

export function RoleBasedSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: roles, isLoading } = useUserRoles();

  // Determine which navigation to show based on role
  const isAdmin = roles?.some(role => role.role === 'admin');
  const navigation = isAdmin ? adminNavigation : receptionistNavigation;

  if (isLoading) {
    return (
      <div className="w-64 h-screen bg-gradient-card border-r border-border/50 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className={cn(
      "h-screen bg-gradient-card border-r border-border/50 transition-all duration-300 shadow-medium",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
              <Scissors className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                SalonSpark
              </h1>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? 'Admin Panel' : 'Reception Desk'}
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hover:bg-accent/50"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start transition-smooth",
                  isActive 
                    ? "bg-gradient-primary text-primary-foreground shadow-primary hover:bg-gradient-primary/90" 
                    : "hover:bg-accent/50 hover:text-accent-foreground",
                  isCollapsed && "px-3"
                )}
              >
                <Icon className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              © 2024 SalonSpark Pro
            </p>
            <p className="text-xs text-muted-foreground/70">
              v1.0.0 • {isAdmin ? 'Admin' : 'Receptionist'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
