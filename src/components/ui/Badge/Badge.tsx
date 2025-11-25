import { cn } from '@/utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) => {
  const variantClasses = {
    default: 'bg-surface-700 text-surface-200',
    success: 'bg-success-500/20 text-success-400 border border-success-500/30',
    warning: 'bg-warning-500/20 text-warning-400 border border-warning-500/30',
    danger: 'bg-danger-500/20 text-danger-400 border border-danger-500/30',
    info: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export { Badge };
