import { CategoryIcon } from '@/components/ui/CategoryIcon/CategoryIcon';
import { cn } from '@/utils/cn';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';

export interface CategoryOption {
  value: string;
  label: string;
  icon?: string;
  color?: string;
  disabled?: boolean;
}

export interface CategorySelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: CategoryOption[];
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  name?: string;
}

const CategorySelect = forwardRef<HTMLButtonElement, CategorySelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder = 'Select...',
      value,
      onValueChange,
      disabled,
      name,
    },
    ref
  ) => {
    const selectedOption = options.find(opt => opt.value === value);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-200 mb-1.5">
            {label}
          </label>
        )}
        
        <SelectPrimitive.Root 
          value={value} 
          onValueChange={onValueChange}
          disabled={disabled}
          name={name}
        >
          <SelectPrimitive.Trigger
            ref={ref}
            className={cn(
              'w-full flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm transition-colors duration-200',
              'border border-surface-700 bg-surface-800/50',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'data-placeholder:text-surface-500',
              error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/30',
              className
            )}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              {selectedOption?.icon && (
                <span 
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: (selectedOption.color || '#6b7280') + '20' }}
                >
                  <CategoryIcon 
                    icon={selectedOption.icon} 
                    color={selectedOption.color} 
                    size="sm" 
                  />
                </span>
              )}
              <SelectPrimitive.Value placeholder={placeholder} />
            </span>
            <SelectPrimitive.Icon>
              <ChevronDown className="h-4 w-4 text-surface-500 shrink-0" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className={cn(
                'overflow-hidden rounded-xl border border-surface-700 bg-surface-800 shadow-xl',
                'animate-in fade-in-0 zoom-in-95',
                'z-50 w-(--radix-select-trigger-width)'
              )}
              position="popper"
              sideOffset={4}
            >
              <SelectPrimitive.Viewport className="p-1.5 max-h-[280px]">
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm cursor-pointer select-none outline-none',
                      'text-surface-200',
                      'data-highlighted:bg-surface-700/50 data-highlighted:text-surface-50',
                      'data-disabled:opacity-50 data-disabled:pointer-events-none'
                    )}
                  >
                    {option.icon && (
                      <span 
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: (option.color || '#6b7280') + '20' }}
                      >
                        <CategoryIcon 
                          icon={option.icon} 
                          color={option.color} 
                          size="sm" 
                        />
                      </span>
                    )}
                    <SelectPrimitive.ItemText className="flex-1 truncate">
                      {option.label}
                    </SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="shrink-0 ml-auto">
                      <Check className="h-4 w-4 text-primary-400" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>

        {error && (
          <p className="mt-1.5 text-sm text-danger-400">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="mt-1.5 text-sm text-surface-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

CategorySelect.displayName = 'CategorySelect';

export { CategorySelect };
