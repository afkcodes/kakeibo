import { cn } from '@/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-linear-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 shadow-lg shadow-primary-500/25',
        secondary:
          'bg-surface-800 text-surface-100 hover:bg-surface-700 focus:ring-surface-500 border border-surface-700',
        danger:
          'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 shadow-lg shadow-danger-500/25',
        success:
          'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-lg shadow-success-500/25',
        warning:
          'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 shadow-lg shadow-warning-500/25',
        ghost:
          'bg-transparent hover:bg-surface-800 text-surface-300 hover:text-surface-100',
        outline:
          'border border-surface-600 bg-transparent hover:bg-surface-800 text-surface-300 hover:text-surface-100',
        link: 'bg-transparent underline-offset-4 hover:underline text-primary-400 hover:text-primary-300',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
