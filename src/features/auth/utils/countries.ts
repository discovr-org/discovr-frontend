export type Country = {
  /** ISO 3166-1 alpha-2, e.g. "IN" */
  iso: string;
  name: string;
  /** Dial code without "+", e.g. "91" */
  dial: string;
  /** National number length range, without trunk prefix */
  min: number;
  max: number;
};

/**
 * India first, then A to Z.
 * Swap for a full list (and libphonenumber-js for exact rules) when you go global.
 */
export const COUNTRIES: Country[] = [
  { iso: 'IN', name: 'India', dial: '91', min: 10, max: 10 },
  { iso: 'AU', name: 'Australia', dial: '61', min: 9, max: 9 },
  { iso: 'BD', name: 'Bangladesh', dial: '880', min: 10, max: 10 },
  { iso: 'BT', name: 'Bhutan', dial: '975', min: 8, max: 8 },
  { iso: 'CA', name: 'Canada', dial: '1', min: 10, max: 10 },
  { iso: 'CN', name: 'China', dial: '86', min: 11, max: 11 },
  { iso: 'FR', name: 'France', dial: '33', min: 9, max: 9 },
  { iso: 'DE', name: 'Germany', dial: '49', min: 10, max: 11 },
  { iso: 'ID', name: 'Indonesia', dial: '62', min: 9, max: 12 },
  { iso: 'IL', name: 'Israel', dial: '972', min: 9, max: 9 },
  { iso: 'IT', name: 'Italy', dial: '39', min: 9, max: 10 },
  { iso: 'JP', name: 'Japan', dial: '81', min: 10, max: 10 },
  { iso: 'KW', name: 'Kuwait', dial: '965', min: 8, max: 8 },
  { iso: 'MY', name: 'Malaysia', dial: '60', min: 9, max: 10 },
  { iso: 'MV', name: 'Maldives', dial: '960', min: 7, max: 7 },
  { iso: 'NP', name: 'Nepal', dial: '977', min: 10, max: 10 },
  { iso: 'NL', name: 'Netherlands', dial: '31', min: 9, max: 9 },
  { iso: 'NZ', name: 'New Zealand', dial: '64', min: 8, max: 10 },
  { iso: 'OM', name: 'Oman', dial: '968', min: 8, max: 8 },
  { iso: 'QA', name: 'Qatar', dial: '974', min: 8, max: 8 },
  { iso: 'RU', name: 'Russia', dial: '7', min: 10, max: 10 },
  { iso: 'SA', name: 'Saudi Arabia', dial: '966', min: 9, max: 9 },
  { iso: 'SG', name: 'Singapore', dial: '65', min: 8, max: 8 },
  { iso: 'ZA', name: 'South Africa', dial: '27', min: 9, max: 9 },
  { iso: 'KR', name: 'South Korea', dial: '82', min: 9, max: 10 },
  { iso: 'ES', name: 'Spain', dial: '34', min: 9, max: 9 },
  { iso: 'LK', name: 'Sri Lanka', dial: '94', min: 9, max: 9 },
  { iso: 'SE', name: 'Sweden', dial: '46', min: 7, max: 9 },
  { iso: 'CH', name: 'Switzerland', dial: '41', min: 9, max: 9 },
  { iso: 'TH', name: 'Thailand', dial: '66', min: 9, max: 9 },
  { iso: 'TR', name: 'Turkey', dial: '90', min: 10, max: 10 },
  { iso: 'AE', name: 'United Arab Emirates', dial: '971', min: 9, max: 9 },
  { iso: 'GB', name: 'United Kingdom', dial: '44', min: 10, max: 10 },
  { iso: 'US', name: 'United States', dial: '1', min: 10, max: 10 },
];
