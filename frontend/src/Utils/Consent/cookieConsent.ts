/**
 * Client-side cookie consent persistence. Components never touch localStorage
 * directly — they go through the store, and the store goes through these
 * helpers. Fully self-contained: no server calls, localStorage only.
 */

/** localStorage key holding the persisted cookie consent record. */
export const COOKIE_CONSENT_STORAGE_KEY = "websiteTemplate.cookieConsent";

/**
 * Consent schema version. Bump this whenever the cookie policy changes so
 * returning visitors are prompted again instead of keeping a stale choice.
 */
export const COOKIE_CONSENT_VERSION = 1;

/**
 * How long a consent decision stays valid. The CNIL recommends re-asking
 * for consent at a reasonable interval (~6 months); past this delay the
 * stored choice is discarded and the banner is shown again.
 */
export const COOKIE_CONSENT_MAX_AGE_DAYS = 182;

/** Optional cookie categories the visitor can opt in or out of. */
export type CookieConsentCategory = "analytics" | "marketing";

/** Cookie categories the visitor can opt in or out of. */
export interface CookieConsentPreferences {
  /** Strictly required cookies — always granted, never togglable. */
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

/** Persisted consent record, with the version and timestamp of the decision. */
export interface CookieConsentRecord {
  /** Client-generated id, useful to correlate the decision client-side. */
  id: string;
  version: number;
  decidedAt: string;
  preferences: CookieConsentPreferences;
}

export function clearCookieConsent(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
}

/** True when a stored decision is older than the allowed validity window. */
export function isCookieConsentExpired(record: CookieConsentRecord): boolean {
  const decidedAt = new Date(record.decidedAt).getTime();

  if (Number.isNaN(decidedAt)) {
    return true;
  }

  const maxAgeMs = COOKIE_CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - decidedAt > maxAgeMs;
}

export function readCookieConsent(): CookieConsentRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const record = JSON.parse(raw) as CookieConsentRecord;

    // Discard records that are malformed, from an older policy version, or
    // expired — in every case the visitor must be asked to decide again.
    if (
      !record.id ||
      !record.preferences ||
      record.version !== COOKIE_CONSENT_VERSION ||
      isCookieConsentExpired(record)
    ) {
      return null;
    }

    return record;
  } catch {
    clearCookieConsent();
    return null;
  }
}

export function writeCookieConsent(
  preferences: CookieConsentPreferences,
): CookieConsentRecord {
  const record: CookieConsentRecord = {
    id: crypto.randomUUID(),
    version: COOKIE_CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    preferences,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(record),
    );
  }

  return record;
}

/**
 * Whether a given non-essential category is currently granted. Use this to
 * gate analytics/marketing scripts — they must not load before consent
 * (ePrivacy Directive art. 5(3)).
 */
export function hasConsent(
  record: CookieConsentRecord | null,
  category: CookieConsentCategory,
): boolean {
  return record?.preferences[category] === true;
}
