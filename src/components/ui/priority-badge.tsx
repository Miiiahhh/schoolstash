import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: 'alta' | 'média' | 'baixa';
  className?: string;
}

const priorityConfig = {
  alta: 'bg-destructive/10 text-destructive border-destructive/20',
  média: 'bg-warning/10 text-warning border-warning/20',
  baixa: 'bg-success/10 text-success border-success/20'
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-smooth",
      priorityConfig[priority],
      className
    )}>
      {priority}
    </span>
  );
}