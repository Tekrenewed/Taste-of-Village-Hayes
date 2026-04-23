/**
 * UK Phone number validation and formatting utilities.
 * UK mobile numbers are 11 digits starting with 07.
 */

/**
 * Validates a UK mobile phone number.
 * Accepts formats: 07XXX XXXXXX, 07XXXXXXXXX, +447XXXXXXXXX, 00447XXXXXXXXX
 * Returns true if valid (11 digits after normalisation).
 */
export function isValidUKMobile(phone: string): boolean {
  const cleaned = normaliseUKPhone(phone);
  // Must be exactly 11 digits starting with 07
  return /^07\d{9}$/.test(cleaned);
}

/**
 * Normalises a phone number to standard UK format (07XXX XXXXXX).
 * Strips spaces, dashes, brackets and converts international prefix.
 */
export function normaliseUKPhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  // Convert +44 or 0044 to 0
  cleaned = cleaned.replace(/^(\+44|0044)/, '0');
  return cleaned;
}

/**
 * Returns a user-friendly error message for invalid phone numbers.
 */
export function getPhoneError(phone: string): string | null {
  if (!phone.trim()) return null; // empty is handled by required attribute
  const cleaned = normaliseUKPhone(phone);
  
  if (!/^\d+$/.test(cleaned)) {
    return 'Phone number should only contain digits';
  }
  if (!cleaned.startsWith('07')) {
    return 'UK mobile numbers start with 07';
  }
  if (cleaned.length < 11) {
    return `Too short — need ${11 - cleaned.length} more digit${11 - cleaned.length > 1 ? 's' : ''}`;
  }
  if (cleaned.length > 11) {
    return 'Too long — UK mobile numbers are 11 digits';
  }
  return null;
}

/**
 * Captures the client's IP address and approximate location.
 * Uses a free, privacy-respecting API (no tracking, no cookies).
 * Returns null if the lookup fails (network issues, ad blockers, etc).
 */
export async function captureClientMeta(): Promise<{
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
} | null> {
  try {
    const res = await fetch('https://ipinfo.io/json?token=', { 
      signal: AbortSignal.timeout(3000) // 3s timeout — don't block order
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      ip: data.ip || 'unknown',
      city: data.city,
      region: data.region,
      country: data.country,
      loc: data.loc, // lat,lng
      org: data.org, // ISP
    };
  } catch {
    // Silently fail — don't block the order for a geo lookup
    return null;
  }
}
