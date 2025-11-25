import { useAppStore } from '@/store';
import { formatCurrency as formatCurrencyUtil } from '@/utils/formatters';
import { useCallback } from 'react';

/**
 * Hook that returns a currency formatter using the user's preferred currency setting
 */
export const useCurrency = () => {
  const { settings } = useAppStore();
  const currency = settings.currency || 'USD';

  const formatCurrency = useCallback(
    (amount: number) => {
      // Map currency to appropriate locale
      const localeMap: Record<string, string> = {
        USD: 'en-US',
        EUR: 'de-DE',
        GBP: 'en-GB',
        JPY: 'ja-JP',
        INR: 'en-IN',
      };

      const locale = localeMap[currency] || 'en-US';
      return formatCurrencyUtil(amount, currency, locale);
    },
    [currency]
  );

  return { formatCurrency, currency };
};
