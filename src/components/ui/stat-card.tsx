import { LucideIcon, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: number;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = "bg-gradient-primary",
  trend,
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-gradient-card rounded-xl shadow-card p-6 border border-border/50 hover:shadow-elegant transition-smooth",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm text-success">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+{trend}% este mês</span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl",
          iconColor
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
