import { cn } from '@/utils/cn';
import * as SelectPrimitive from '@radix-ui/react-select';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Check, ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  name?: string;
}

// Helper to get Lucide icon by name
const getIcon = (iconName: string): LucideIcon | null => {
  const pascalCase = iconName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[pascalCase];
  return IconComponent || null;
};

const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder = 'Select...',
      value,
      defaultValue,
      onValueChange,
      disabled,
      name,
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-200 mb-1.5">
            {label}
          </label>
        )}
        
        <SelectPrimitive.Root 
          value={value} 
          defaultValue={defaultValue}
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
            <SelectPrimitive.Value placeholder={placeholder} className="text-surface-100" />
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
                {options.map((option) => {
                  const IconComponent = option.icon ? getIcon(option.icon) : null;
                  return (
                    <SelectPrimitive.Item
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className={cn(
                        'flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm cursor-pointer select-none outline-none',
                        'text-surface-200',
                        'data-highlighted:bg-surface-700/50 data-highlighted:text-surface-50',
                        'data-disabled:opacity-50 data-disabled:pointer-events-none'
                      )}
                    >
                      <SelectPrimitive.ItemText className="flex-1">
                        <span className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="h-4 w-4 text-surface-400" />}
                          {option.label}
                        </span>
                      </SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator className="shrink-0">
                        <Check className="h-4 w-4 text-primary-400" />
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                  );
                })}
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

Select.displayName = 'Select';

export { Select };
