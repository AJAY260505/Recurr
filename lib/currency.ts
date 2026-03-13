export const localeToCurrency = {
  'en-AU': 'AUD',
  'en-CA': 'CAD',
  'en-GB': 'GBP',
  'en-IE': 'EUR',
  'en-IN': 'INR',
  'en-NZ': 'NZD',
  'en-US': 'USD',
  'en-ZA': 'ZAR',
  'es-AR': 'ARS',
  'es-CL': 'CLP',
  'es-CO': 'COP',
  'es-ES': 'EUR',
  'es-MX': 'MXN',
  'es-US': 'USD',
  'fr-BE': 'EUR',
  'fr-CA': 'CAD',
  'fr-CH': 'CHF',
  'fr-FR': 'EUR',
  'ar-SA': 'SAR',
  'bn-BD': 'BDT',
  'bn-IN': 'INR',
  'cs-CZ': 'CZK',
  'da-DK': 'DKK',
  'de-AT': 'EUR',
  'de-CH': 'CHF',
  'de-DE': 'EUR',
  'el-GR': 'EUR',
  'fi-FI': 'EUR',
  'he-IL': 'ILS',
  'hi-IN': 'INR',
  'hu-HU': 'HUF',
  'it-CH': 'CHF',
  'it-IT': 'EUR',
  'ja-JP': 'JPY',
  'ko-KR': 'KRW',
  'nl-BE': 'EUR',
  'nl-NL': 'EUR',
  'no-NO': 'NOK',
  'pl-PL': 'PLN',
  'pt-BR': 'BRL',
  'ro-RO': 'RON',
  'ru-RU': 'RUB',
  'sk-SK': 'EUR',
  'sv-SE': 'SEK',
  'ta-IN': 'INR',
  'ta-LK': 'LKR',
  'th-TH': 'THB',
  'tr-TR': 'TRY',
  'zh-CN': 'CNY',
  'zh-HK': 'HKD',
  'zh-TW': 'TWD',
};

export const currencyToName = {
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  GBP: 'British Pound',
  EUR: 'Euro',
  INR: 'Indian Rupee',
  NZD: 'New Zealand Dollar',
  USD: 'United States Dollar',
  ZAR: 'South African Rand',
  ARS: 'Argentine Peso',
  CLP: 'Chilean Peso',
  COP: 'Colombian Peso',
  MXN: 'Mexican Peso',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  HKD: 'Hong Kong Dollar',
  JPY: 'Japanese Yen',
  KRW: 'South Korean Won',
  TWD: 'New Taiwan Dollar',
  RUB: 'Russian Ruble',
  SEK: 'Swedish Krona',
  THB: 'Thai Baht',
  TRY: 'Turkish Lira',
  BDT: 'Bangladeshi Taka',
  CZK: 'Czech Koruna',
  DKK: 'Danish Krone',
  HUF: 'Hungarian Forint',
  ILS: 'Israeli New Shekel',
  NOK: 'Norwegian Krone',
  PLN: 'Polish Zloty',
  RON: 'Romanian Leu',
  SAR: 'Saudi Riyal',
  BRL: 'Brazilian Real',
  LKR: 'Sri Lankan Rupee',
};

export const getCurrency = () => {
  if (typeof window !== 'undefined') {
    const currencyPreference = localStorage.getItem('CURRENCY_PREFERENCE');
    if (
      currencyPreference &&
      currencyToName[currencyPreference as keyof typeof currencyToName]
    ) {
      return currencyPreference;
    }

    const locale = window.navigator.language as keyof typeof localeToCurrency;
    return localeToCurrency[locale] || 'USD';
  }
  return 'USD';
};

export const getCurrencySymbol = () => {
  if (typeof window !== 'undefined') {
    const currencyPreference = localStorage.getItem('CURRENCY_PREFERENCE');
    if (
      currencyPreference &&
      currencyToName[currencyPreference as keyof typeof currencyToName]
    ) {
      const locale = window.navigator.language;
      return Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyPreference,
        currencyDisplay: 'narrowSymbol',
      }).format(0)[0];
    }

    const locale = window.navigator.language as keyof typeof localeToCurrency;
    const currencyCode = localeToCurrency[locale] || 'USD';
    return Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'narrowSymbol',
    }).format(0)[0];
  }
  return '$'; // Default to USD symbol
};
