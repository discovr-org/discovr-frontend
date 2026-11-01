import { COUNTRIES, type Country } from './countries';

export const INVALID_NUMBER = 'Enter a valid mobile number';

export function findCountry(iso: string): Country {
  return COUNTRIES.find((c) => c.iso === iso) ?? COUNTRIES[0];
}

/** Regional-indicator flag emoji from an ISO code. Windows shows letters instead. */
export function flagOf(iso: string): string {
  return String.fromCodePoint(iso.charCodeAt(0) + 127397, iso.charCodeAt(1) + 127397);
}

/** Digits only, drops a typed dial code or trunk "0", caps at the country's max length. */
export function cleanNational(raw: string, c: Country): string {
  let d = raw.replace(/\D/g, '');
  if (d.length > c.max && d.startsWith(c.dial)) d = d.slice(c.dial.length);
  if (d.startsWith('0')) d = d.slice(1);
  return d.slice(0, c.max);
}

/** A pasted "+44 7911 123456" or "0044 ..." returns the matching country. */
export function detectCountry(raw: string, current: Country): Country | null {
  const t = raw.trim();
  if (!(t.startsWith('+') || t.startsWith('00'))) return null;
  const d = t.replace(/\D/g, '').replace(/^00/, '');
  if (d.startsWith(current.dial)) return current;
  let best: Country | null = null;
  for (const c of COUNTRIES) {
    if (d.startsWith(c.dial) && (!best || c.dial.length > best.dial.length)) best = c;
  }
  return best;
}

/** Strips the international prefix from a raw value once a country is detected. */
export function stripDial(raw: string, c: Country): string {
  return raw.replace(/\D/g, '').replace(/^00/, '').slice(c.dial.length);
}

export function formatNational(d: string, c: Country): string {
  if (c.iso === 'IN') return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
  return d.replace(/(\d{3})(?=\d{3,})/g, '$1 ');
}

export function isValidNational(d: string, c: Country): boolean {
  if (c.iso === 'IN') return /^[6-9]\d{9}$/.test(d);
  return d.length >= c.min && d.length <= c.max;
}

export function toE164(d: string, c: Country): string {
  return `+${c.dial}${d}`;
}
