import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';
import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-surface-200 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full rounded-xl px-4 py-2.5 text-sm text-surface-100 transition-colors duration-200 appearance-none',
              'border border-surface-700',
              'bg-surface-800/50',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-900',
              error &&
                'border-danger-500 focus:border-danger-500 focus:ring-danger-500/30',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error
                ? `${selectId}-error`
                : helperText
                  ? `${selectId}-helper`
                  : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-surface-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-1.5 text-sm text-danger-400"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${selectId}-helper`}
            className="mt-1.5 text-sm text-surface-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
