import { cn } from '@/utils/cn';

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

const ProgressBar = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className,
  animated = true,
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Auto-determine variant based on percentage if not explicitly set
  const getAutoVariant = () => {
    if (variant !== 'default') return variant;
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'default';
  };

  const actualVariant = getAutoVariant();

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantClasses = {
    default: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium text-surface-200">
            {label}
          </span>
          {showLabel && (
            <span className="text-sm font-medium text-surface-400 font-amount">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-surface-800 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantClasses[actualVariant],
            animated && 'animate-pulse-subtle'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';

export { ProgressBar };
