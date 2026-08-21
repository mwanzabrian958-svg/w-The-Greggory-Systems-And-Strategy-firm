// System-level currency management (no database required)

export const formatKSH = (amount) => {
  const val = typeof amount === 'string' ? parseFloat(amount) : amount;
  return "KSH " + (val || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const SYSTEM_CURRENCIES = [
  {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSH',
    exchangeRate: 1.000000,
    region: 'Kenya',
    isDefault: true,
    isActive: true
  }
]

// Currency utility functions
export const getCurrencyByCode = (code) => {
  return SYSTEM_CURRENCIES.find(currency => 
    currency.code.toLowerCase() === code.toLowerCase()
  )
}

export const getDefaultCurrency = () => {
  return SYSTEM_CURRENCIES.find(currency => currency.isDefault)
}

export const formatCurrency = (amount) => {
  return formatKSH(amount);
}
