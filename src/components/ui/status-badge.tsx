import { cn } from '@/lib/utils';

type BadgeVariant = 
  | 'default' 
  | 'success' 
  | 'warning' 
  | 'destructive' 
  | 'info'
   | 'error'
  | 'outline';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-info/10 text-info border-info/20',
   error: 'bg-destructive/10 text-destructive border-destructive/20',
  outline: 'bg-transparent border-border text-foreground',
};

export function StatusBadge({ 
  children, 
  variant = 'default', 
  className,
  pulse = false 
}: StatusBadgeProps) {
  return (
    <span className={cn(
      'status-badge border',
      variantStyles[variant],
      pulse && 'pulse-urgent',
      className
    )}>
      {pulse && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  );
}

// Helper function to get appropriate variant based on status
export function getStatusVariant(status: string): BadgeVariant {
  const statusMap: Record<string, BadgeVariant> = {
    // Appointment statuses
    'scheduled': 'info',
    'checked-in': 'warning',
    'in-progress': 'success',
    'completed': 'success',
    'cancelled': 'destructive',
    'no-show': 'destructive',
    // Lab test statuses
    'pending': 'warning',
    'dispensed': 'success',
    // Staff statuses
    'active': 'success',
    'inactive': 'default',
    'on-leave': 'warning',
    // Priority
    'routine': 'default',
    'urgent': 'warning',
    'stat': 'destructive',
  };
  
  return statusMap[status] || 'default';
}
