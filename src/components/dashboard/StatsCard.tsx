import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  variant?: "default" | "primary" | "secondary" | "accent";
  linkTo?: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon, 
  variant = "default",
  linkTo
}: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive": return "text-success";
      case "negative": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getIconBackground = () => {
    switch (variant) {
      case "primary": return "bg-gradient-primary text-primary-foreground";
      case "secondary": return "bg-gradient-secondary text-secondary-foreground";
      case "accent": return "bg-accent-medium text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const cardContent = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg", getIconBackground())}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <Badge 
            variant="outline" 
            className={cn("mt-2 text-xs", getChangeColor())}
          >
            {change}
          </Badge>
        )}
      </CardContent>
    </>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block">
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card className="card-premium hover:shadow-medium transition-smooth cursor-pointer">
            {cardContent}
          </Card>
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card className="card-premium hover:shadow-medium transition-smooth">
        {cardContent}
      </Card>
    </motion.div>
  );
}