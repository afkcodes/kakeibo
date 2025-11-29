import { CategoryIcon } from '@/components/ui/CategoryIcon/CategoryIcon';
import { cn } from '@/utils/cn';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown, X } from 'lucide-react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

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

const CategorySelect = forwardRef<HTMLInputElement, CategorySelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder = 'Search categories...',
      value,
      onValueChange,
      disabled,
      name,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    
    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = useMemo(() => {
      if (!searchQuery.trim()) return options;
      const query = searchQuery.toLowerCase();
      return options.filter(opt => 
        opt.label.toLowerCase().includes(query)
      );
    }, [options, searchQuery]);

    // Reset highlight when filtered options change
    useEffect(() => {
      setHighlightedIndex(0);
    }, [filteredOptions]);

    // Scroll highlighted item into view
    useEffect(() => {
      if (open && listRef.current) {
        const highlightedEl = listRef.current.children[highlightedIndex] as HTMLElement;
        highlightedEl?.scrollIntoView({ block: 'nearest' });
      }
    }, [highlightedIndex, open]);

    const handleSelect = (option: CategoryOption) => {
      onValueChange?.(option.value);
      setOpen(false);
      setSearchQuery('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      if (!open) setOpen(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
          setOpen(true);
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(i => 
            i < filteredOptions.length - 1 ? i + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(i => 
            i > 0 ? i - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setOpen(false);
          setSearchQuery('');
          break;
        case 'Tab':
          setOpen(false);
          setSearchQuery('');
          break;
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onValueChange?.('');
      setSearchQuery('');
      inputRef.current?.focus();
    };

    // Display value: show search query when typing, otherwise show selected label
    const displayValue = open ? searchQuery : (selectedOption?.label || '');

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-200 mb-1.5">
            {label}
          </label>
        )}
        
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Anchor asChild>
            <div
              onClick={() => !disabled && setOpen(true)}
              className={cn(
                'relative flex items-center gap-2 rounded-xl px-3 h-11 text-sm transition-colors duration-200 cursor-text',
                'border border-surface-700 bg-surface-800/50',
                'focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:border-primary-500',
                disabled && 'opacity-50 cursor-not-allowed',
                error && 'border-danger-500 focus-within:border-danger-500 focus-within:ring-danger-500/30',
                className
              )}
            >
              {/* Selected category icon - always reserve space when value exists */}
              {selectedOption?.icon && (
                <span 
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                    open && 'hidden'
                  )}
                  style={{ backgroundColor: (selectedOption.color || '#6b7280') + '20' }}
                >
                  <CategoryIcon 
                    icon={selectedOption.icon} 
                    color={selectedOption.color} 
                    size="sm" 
                  />
                </span>
              )}
              
              <input
                ref={(node) => {
                  // Handle both refs
                  if (typeof ref === 'function') ref(node);
                  else if (ref) ref.current = node;
                  (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
                }}
                type="text"
                name={name}
                value={displayValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  'flex-1 bg-transparent outline-none min-w-0',
                  'text-surface-100 placeholder:text-surface-500'
                )}
                autoComplete="off"
              />
              
              {/* Clear button */}
              {value && !open && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-0.5 rounded hover:bg-surface-700/50 text-surface-500 hover:text-surface-300 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {/* Chevron */}
              <ChevronDown 
                className={cn(
                  'w-4 h-4 text-surface-500 shrink-0 transition-transform duration-200',
                  open && 'rotate-180'
                )} 
              />
            </div>
          </Popover.Anchor>

          <Popover.Portal>
            <Popover.Content
              className={cn(
                'overflow-hidden rounded-xl border border-surface-700 bg-surface-800 shadow-xl',
                'animate-in fade-in-0 zoom-in-95',
                'z-50 w-(--radix-popover-trigger-width)'
              )}
              side="bottom"
              sideOffset={4}
              avoidCollisions={false}
              onOpenAutoFocus={(e: Event) => e.preventDefault()}
            >
              <div 
                ref={listRef}
                className="p-1.5 max-h-[280px] overflow-y-auto"
              >
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-surface-500">
                    No categories found
                  </div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm cursor-pointer select-none outline-none text-left',
                        'text-surface-200 transition-colors',
                        index === highlightedIndex && 'bg-surface-700/50 text-surface-50',
                        option.disabled && 'opacity-50 pointer-events-none',
                        option.value === value && 'text-primary-400'
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
                      <span className="flex-1 truncate">
                        {option.label}
                      </span>
                      {option.value === value && (
                        <Check className="h-4 w-4 text-primary-400 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

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
