import { cn } from '@/utils/cn';
import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(7)}`;

    const variantClasses = {
      default:
        'border border-surface-700 bg-surface-800/50 focus:border-primary-500 focus:ring-primary-500/30',
      filled:
        'border-0 bg-surface-800 focus:bg-surface-800 focus:ring-2 focus:ring-primary-500/30',
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-200 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-500">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full rounded-xl px-4 py-2.5 text-sm text-surface-100 transition-colors duration-200',
              'placeholder:text-surface-500',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-900',
              variantClasses[variant],
              error &&
                'border-danger-500 focus:border-danger-500 focus:ring-danger-500/30',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              // Date input specific styling - hide native icons on all browsers
              type === 'date' && [
                '[&::-webkit-calendar-picker-indicator]:hidden',
                '[&::-webkit-inner-spin-button]:hidden',
                '[&::-webkit-clear-button]:hidden',
                '[&::-ms-clear]:hidden',
                '[&::-webkit-datetime-edit]:text-surface-100',
                '[&::-webkit-datetime-edit-fields-wrapper]:text-surface-100',
                '[&::-webkit-datetime-edit-text]:text-surface-400',
                '[&::-webkit-datetime-edit-month-field]:text-surface-100',
                '[&::-webkit-datetime-edit-day-field]:text-surface-100',
                '[&::-webkit-datetime-edit-year-field]:text-surface-100',
                'cursor-pointer',
                '[appearance:textfield]',
              ],
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-danger-400"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-sm text-surface-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
