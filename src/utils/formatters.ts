import { format, formatDistance, formatRelative, isToday, isYesterday } from 'date-fns';

/**
 * Format a number as currency
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number as currency with compact notation for large numbers
 * Shows full number up to 7 digits, then abbreviates (K, M, B, etc.)
 */
export const formatCurrencyCompact = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  const absAmount = Math.abs(amount);
  
  // If less than 10 million (7 digits), show full number
  if (absAmount < 10000000) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  
  // For larger numbers, use compact notation
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(amount);
};

/**
 * Format a number with compact notation (e.g., 1K, 1M)
 */
export const formatCompactNumber = (
  num: number,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
};

/**
 * Format a percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a date to a specific format
 */
export const formatDate = (
  date: Date | string,
  formatStr: string = 'MMM dd, yyyy'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
};

/**
 * Format a date to relative time (e.g., "2 days ago")
 */
export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return 'Today';
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

/**
 * Format a date relative to now with context
 */
export const formatRelativeDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatRelative(dateObj, new Date());
};

/**
 * Format time only
 */
export const formatTime = (
  date: Date | string,
  formatStr: string = 'h:mm a'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format a number with thousands separator
 */
export const formatNumber = (
  num: number,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale).format(num);
};
