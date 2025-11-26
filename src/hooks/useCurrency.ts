import { useAppStore } from '@/store';
import { formatCurrencyCompact as formatCurrencyCompactUtil, formatCurrency as formatCurrencyUtil } from '@/utils/formatters';
import { useCallback } from 'react';

/**
 * Hook that returns currency formatters using the user's preferred currency setting
 */
export const useCurrency = () => {
  const { settings } = useAppStore();
  const currency = settings.currency || 'USD';

  // Map currency to appropriate locale
  const localeMap: Record<string, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    INR: 'en-IN',
  };

  const locale = localeMap[currency] || 'en-US';

  // Full currency format (always shows all digits)
  const formatCurrency = useCallback(
    (amount: number) => {
      return formatCurrencyUtil(amount, currency, locale);
    },
    [currency, locale]
  );

  // Compact currency format (abbreviates large numbers: K, M, B)
  const formatCurrencyCompact = useCallback(
    (amount: number) => {
      return formatCurrencyCompactUtil(amount, currency, locale);
    },
    [currency, locale]
  );

  return { formatCurrency, formatCurrencyCompact, currency };
};
