import { useAuth } from '../context/AuthContext';

// Currency symbols mapping
export const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  INR: '₹',
  CNY: '¥',
  KRW: '₩',
  BRL: 'R$',
  PKR: '₨'
};

// Currency names mapping
export const currencyNames = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  INR: 'Indian Rupee',
  CNY: 'Chinese Yuan',
  KRW: 'South Korean Won',
  BRL: 'Brazilian Real',
  PKR: 'Pakistani Rupee'
};

// Format currency based on user's preference
export const formatCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  }
};

// Hook to get user's currency preference
export const useCurrency = () => {
  const { user } = useAuth();
  const currency = user?.profile?.currency || 'USD';
  return {
    currency,
    symbol: currencySymbols[currency] || '$',
    name: currencyNames[currency] || 'US Dollar',
    format: (amount) => formatCurrency(amount, currency)
  };
};

// Format date based on user's preference
export const formatDate = (date, format = 'MM/dd/yyyy') => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  switch (format) {
    case 'MM/dd/yyyy':
      return `${month}/${day}/${year}`;
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`;
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    case 'dd-MM-yyyy':
      return `${day}-${month}-${year}`;
    default:
      return `${month}/${day}/${year}`;
  }
};

// Hook to get user's date format preference
export const useDateFormat = () => {
  const { user } = useAuth();
  const dateFormat = user?.profile?.dateFormat || 'MM/dd/yyyy';
  return {
    format: dateFormat,
    formatDate: (date) => formatDate(date, dateFormat)
  };
};