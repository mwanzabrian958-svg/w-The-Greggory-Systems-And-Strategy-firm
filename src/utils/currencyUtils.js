// System-level currency management (no database required)

export const SYSTEM_CURRENCIES = [
  {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KES',
    exchangeRate: 1.000000,
    region: 'Kenya',
    isDefault: true,
    isActive: true
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    exchangeRate: 0.006500,
    region: 'United States',
    isDefault: false,
    isActive: true
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: 'EUR',
    exchangeRate: 0.007100,
    region: 'European Union',
    isDefault: false,
    isActive: true
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    exchangeRate: 0.005200,
    region: 'United Kingdom',
    isDefault: false,
    isActive: true
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    exchangeRate: 0.950000,
    region: 'Japan',
    isDefault: false,
    isActive: true
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    exchangeRate: 0.004800,
    region: 'Canada',
    isDefault: false,
    isActive: true
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    exchangeRate: 0.004200,
    region: 'Australia',
    isDefault: false,
    isActive: true
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    exchangeRate: 0.000890,
    region: 'China',
    isDefault: false,
    isActive: true
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: 'INR',
    exchangeRate: 0.000078,
    region: 'India',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    exchangeRate: 0.000350,
    region: 'South Africa',
    isDefault: false,
    isActive: true
  },
  {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: 'NGN',
    exchangeRate: 0.0000089,
    region: 'Nigeria',
    isDefault: false,
    isActive: true
  },
  {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: 'GHS',
    exchangeRate: 0.000054,
    region: 'Ghana',
    isDefault: false,
    isActive: true
  },
  {
    code: 'UGX',
    name: 'Ugandan Shilling',
    symbol: 'UGX',
    exchangeRate: 0.0000017,
    region: 'Uganda',
    isDefault: false,
    isActive: true
  },
  {
    code: 'TZS',
    name: 'Tanzanian Shilling',
    symbol: 'TZS',
    exchangeRate: 0.00000028,
    region: 'Tanzania',
    isDefault: false,
    isActive: true
  },
  {
    code: 'RWF',
    name: 'Rwandan Franc',
    symbol: 'RWF',
    exchangeRate: 0.0000051,
    region: 'Rwanda',
    isDefault: false,
    isActive: true
  },
  {
    code: 'BIF',
    name: 'Burundian Franc',
    symbol: 'BIF',
    exchangeRate: 0.00000035,
    region: 'Burundi',
    isDefault: false,
    isActive: true
  },
  {
    code: 'SSP',
    name: 'South Sudanese Pound',
    symbol: 'SSP',
    exchangeRate: 0.000013,
    region: 'South Sudan',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ETB',
    name: 'Ethiopian Birr',
    symbol: 'ETB',
    exchangeRate: 0.000012,
    region: 'Ethiopia',
    isDefault: false,
    isActive: true
  },
  {
    code: 'SOS',
    name: 'Somali Shilling',
    symbol: 'SOS',
    exchangeRate: 0.0000063,
    region: 'Somalia',
    isDefault: false,
    isActive: true
  },
  {
    code: 'DJF',
    name: 'Djiboutian Franc',
    symbol: 'DJF',
    exchangeRate: 0.0000031,
    region: 'Djibouti',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ERN',
    name: 'Eritrean Nakfa',
    symbol: 'ERN',
    exchangeRate: 0.000043,
    region: 'Eritrea',
    isDefault: false,
    isActive: true
  },
  {
    code: 'MUR',
    name: 'Mauritian Rupee',
    symbol: 'MUR',
    exchangeRate: 0.00014,
    region: 'Mauritius',
    isDefault: false,
    isActive: true
  },
  {
    code: 'SCR',
    name: 'Seychellois Rupee',
    symbol: 'SCR',
    exchangeRate: 0.00049,
    region: 'Seychelles',
    isDefault: false,
    isActive: true
  },
  {
    code: 'KMF',
    name: 'Comorian Franc',
    symbol: 'KMF',
    exchangeRate: 0.000014,
    region: 'Comoros',
    isDefault: false,
    isActive: true
  },
  {
    code: 'MGA',
    name: 'Malagasy Ariary',
    symbol: 'MGA',
    exchangeRate: 0.0000014,
    region: 'Madagascar',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ZMW',
    name: 'Zambian Kwacha',
    symbol: 'ZMW',
    exchangeRate: 0.00027,
    region: 'Zambia',
    isDefault: false,
    isActive: true
  },
  {
    code: 'MWK',
    name: 'Malawian Kwacha',
    symbol: 'MWK',
    exchangeRate: 0.0000036,
    region: 'Malawi',
    isDefault: false,
    isActive: true
  },
  {
    code: 'BWP',
    name: 'Botswana Pula',
    symbol: 'BWP',
    exchangeRate: 0.00047,
    region: 'Botswana',
    isDefault: false,
    isActive: true
  },
  {
    code: 'NAD',
    name: 'Namibian Dollar',
    symbol: 'NAD',
    exchangeRate: 0.00035,
    region: 'Namibia',
    isDefault: false,
    isActive: true
  },
  {
    code: 'AOA',
    name: 'Angolan Kwanza',
    symbol: 'AOA',
    exchangeRate: 0.000014,
    region: 'Angola',
    isDefault: false,
    isActive: true
  },
  {
    code: 'XAF',
    name: 'Central African CFA Franc',
    symbol: 'XAF',
    exchangeRate: 0.000011,
    region: 'Central Africa',
    isDefault: false,
    isActive: true
  },
  {
    code: 'XOF',
    name: 'West African CFA Franc',
    symbol: 'XOF',
    exchangeRate: 0.000011,
    region: 'West Africa',
    isDefault: false,
    isActive: true
  },
  {
    code: 'XPF',
    name: 'CFP Franc',
    symbol: 'XPF',
    exchangeRate: 0.0000059,
    region: 'French Pacific',
    isDefault: false,
    isActive: true
  }
]

// Client location to currency mapping
export const LOCATION_CURRENCY_MAPPING = {
  'kenya': 'KES',
  'united states': 'USD',
  'usa': 'USD',
  'european union': 'EUR',
  'europe': 'EUR',
  'united kingdom': 'GBP',
  'uk': 'GBP',
  'japan': 'JPY',
  'canada': 'CAD',
  'australia': 'AUD',
  'china': 'CNY',
  'india': 'INR',
  'south africa': 'ZAR',
  'nigeria': 'NGN',
  'ghana': 'GHS',
  'uganda': 'UGX',
  'tanzania': 'TZS',
  'rwanda': 'RWF',
  'burundi': 'BIF',
  'south sudan': 'SSP',
  'ethiopia': 'ETB',
  'somalia': 'SOS',
  'djibouti': 'DJF',
  'eritrea': 'ERN',
  'mauritius': 'MUR',
  'seychelles': 'SCR',
  'comoros': 'KMF',
  'madagascar': 'MGA',
  'zambia': 'ZMW',
  'malawi': 'MWK',
  'botswana': 'BWP',
  'namibia': 'NAD',
  'angola': 'AOA',
  'cameroon': 'XAF',
  'chad': 'XAF',
  'central african republic': 'XAF',
  'congo': 'XAF',
  'equatorial guinea': 'XAF',
  'gabon': 'XAF',
  'benin': 'XOF',
  'burkina faso': 'XOF',
  'cote divoire': 'XOF',
  'guinea-bissau': 'XOF',
  'mali': 'XOF',
  'niger': 'XOF',
  'senegal': 'XOF',
  'togo': 'XOF',
  'french polynesia': 'XPF',
  'new caledonia': 'XPF',
  'wallis and futuna': 'XPF'
}

// Currency utility functions
export const getCurrencyByCode = (code) => {
  return SYSTEM_CURRENCIES.find(currency => 
    currency.code.toLowerCase() === code.toLowerCase()
  )
}

export const getDefaultCurrency = () => {
  return SYSTEM_CURRENCIES.find(currency => currency.isDefault)
}

export const getActiveCurrencies = () => {
  return SYSTEM_CURRENCIES.filter(currency => currency.isActive)
}

export const searchCurrencies = (searchTerm, region = null, activeOnly = false) => {
  let currencies = SYSTEM_CURRENCIES

  if (activeOnly) {
    currencies = currencies.filter(currency => currency.isActive)
  }

  if (region) {
    currencies = currencies.filter(currency => 
      currency.region && currency.region.toLowerCase().includes(region.toLowerCase())
    )
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    currencies = currencies.filter(currency =>
      currency.name.toLowerCase().includes(term) ||
      currency.code.toLowerCase().includes(term) ||
      currency.symbol.toLowerCase().includes(term)
    )
  }

  return currencies.sort((a, b) => {
    // Sort by default first, then by name
    if (a.isDefault && !b.isDefault) return -1
    if (!a.isDefault && b.isDefault) return 1
    return a.name.localeCompare(b.name)
  })
}

export const convertCurrency = (amount, fromCurrencyCode, toCurrencyCode) => {
  const fromCurrency = getCurrencyByCode(fromCurrencyCode)
  const toCurrency = getCurrencyByCode(toCurrencyCode)

  if (!fromCurrency || !toCurrency) {
    throw new Error('Invalid currency code')
  }

  // Convert: amount * (to_rate / from_rate)
  const convertedAmount = amount * (toCurrency.exchangeRate / fromCurrency.exchangeRate)
  
  return {
    originalAmount: amount,
    fromCurrency: fromCurrencyCode.toUpperCase(),
    toCurrency: toCurrencyCode.toUpperCase(),
    convertedAmount: convertedAmount,
    exchangeRateUsed: toCurrency.exchangeRate / fromCurrency.exchangeRate,
    fromSymbol: fromCurrency.symbol,
    toSymbol: toCurrency.symbol
  }
}

export const suggestCurrencyByLocation = (location) => {
  if (!location) return getDefaultCurrency()

  const normalizedLocation = location.toLowerCase()
  
  // Check for exact matches first
  for (const [locationKey, currencyCode] of Object.entries(LOCATION_CURRENCY_MAPPING)) {
    if (normalizedLocation === locationKey) {
      return getCurrencyByCode(currencyCode)
    }
  }

  // Check for partial matches
  for (const [locationKey, currencyCode] of Object.entries(LOCATION_CURRENCY_MAPPING)) {
    if (normalizedLocation.includes(locationKey) || locationKey.includes(normalizedLocation)) {
      return getCurrencyByCode(currencyCode)
    }
  }

  // Default to KES if no match found
  return getDefaultCurrency()
}

export const formatCurrency = (amount, currencyCode) => {
  const currency = getCurrencyByCode(currencyCode)
  if (!currency) return amount.toString()

  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)

  return `${currency.symbol} ${formattedAmount}`
}

export const getUniqueRegions = () => {
  const regions = [...new Set(SYSTEM_CURRENCIES.map(currency => currency.region).filter(Boolean))]
  return regions.sort()
}

// Exchange rate update functions (for admin use)
export const updateExchangeRate = (currencyCode, newRate) => {
  const currency = getCurrencyByCode(currencyCode)
  if (currency) {
    currency.exchangeRate = newRate
    return true
  }
  return false
}

export const bulkUpdateExchangeRates = (rateUpdates) => {
  let updatedCount = 0
  
  rateUpdates.forEach(({ code, rate }) => {
    if (updateExchangeRate(code, rate)) {
      updatedCount++
    }
  })

  return updatedCount
}

export const setDefaultCurrency = (currencyCode) => {
  // Unset all defaults first
  SYSTEM_CURRENCIES.forEach(currency => {
    currency.isDefault = false
  })

  // Set new default
  const currency = getCurrencyByCode(currencyCode)
  if (currency) {
    currency.isDefault = true
    return true
  }
  return false
}

export const toggleCurrencyActive = (currencyCode) => {
  const currency = getCurrencyByCode(currencyCode)
  if (currency) {
    currency.isActive = !currency.isActive
    return currency.isActive
  }
  return false
}
