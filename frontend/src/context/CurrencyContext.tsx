import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'MMK' | 'THB';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  formatPrice: (usdAmount: number | string | undefined | null) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Fixed exchange rates for now
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  MMK: 4500,
  THB: 35,
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency') as Currency;
    if (savedCurrency && ['USD', 'MMK', 'THB'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('currency', curr);
  };

  const formatPrice = (usdAmount: number | string | undefined | null): string => {
    if (usdAmount === undefined || usdAmount === null) return '';
    const parsedAmount = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;
    if (isNaN(parsedAmount)) return '';

    const convertedAmount = parsedAmount * EXCHANGE_RATES[currency];

    if (currency === 'USD') {
      return `$${convertedAmount.toFixed(2)}`;
    } else if (currency === 'MMK') {
      // Format MMK with commas (e.g. 45,000) and no decimal places
      return `${Math.round(convertedAmount).toLocaleString('en-US')} Ks`;
    } else if (currency === 'THB') {
      // Format THB with no decimal places if whole, or 2 decimal places if not
      const roundedTHB = Math.round(convertedAmount * 100) / 100;
      return `${roundedTHB.toLocaleString('en-US')} ฿`;
    }
    return '';
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
