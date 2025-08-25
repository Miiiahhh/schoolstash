import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig = {
  ativo: { class: 'bg-primary/10 text-primary border-primary/20', text: 'Ativo' },
  pendente: { class: 'bg-warning/10 text-warning border-warning/20', text: 'Pendente' },
  concluído: { class: 'bg-success/10 text-success border-success/20', text: 'Concluído' },
  atrasado: { class: 'bg-destructive/10 text-destructive border-destructive/20', text: 'Atrasado' },
  regular: { class: 'bg-success/10 text-success border-success/20', text: 'Regular' },
  aprovado: { class: 'bg-success/10 text-success border-success/20', text: 'Aprovado' },
  rejeitado: { class: 'bg-destructive/10 text-destructive border-destructive/20', text: 'Rejeitado' },
  em_analise: { class: 'bg-primary/10 text-primary border-primary/20', text: 'Em análise' }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || { 
    class: 'bg-muted text-muted-foreground border-border', 
    text: status 
  };

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-smooth",
      config.class,
      className
    )}>
      {config.text}
    </span>
  );
}