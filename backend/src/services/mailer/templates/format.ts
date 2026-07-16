import { config } from "@src/helpers/config";
import { EmailLocale, EmailPayload } from "@src/services/mailer/emailConstants";

/** BCP 47 tags used for date and currency formatting, per email locale. */
const INTL_LOCALES: Record<EmailLocale, string> = {
  fr: "fr-BE",
  nl: "nl-BE",
  en: "en-GB",
};

const CURRENCY = "EUR";

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Payload values reach the renderer as `unknown`: they are read back from a
 * JSONB column on retries, so nothing guarantees the producer's shape survived.
 * Every accessor below degrades to a fallback rather than throwing — a missing
 * field must not turn into a permanently failing email.
 */
export const getString = (
  payload: EmailPayload,
  key: string,
  fallback = "",
): string => {
  const value = payload[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
};

export const getNumber = (
  payload: EmailPayload,
  key: string,
): number | null => {
  const value = payload[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

/** Accepts the `Date` an in-process enqueue passes and the ISO string a retry reads back. */
const toDate = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

/** Calendar day of `key`, in the app timezone. Empty when absent or unparseable. */
export const formatDate = (
  payload: EmailPayload,
  key: string,
  locale: EmailLocale,
): string => {
  const date = toDate(payload[key]);
  if (!date) return "";

  return new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    timeZone: config.app.timezone,
    dateStyle: "long",
  }).format(date);
};

/** Day and time of `key`, in the app timezone. Empty when absent or unparseable. */
export const formatDateTime = (
  payload: EmailPayload,
  key: string,
  locale: EmailLocale,
): string => {
  const date = toDate(payload[key]);
  if (!date) return "";

  return new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    timeZone: config.app.timezone,
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

/** Amount stored in cents rendered as currency. Empty when absent. */
export const formatMoney = (
  payload: EmailPayload,
  key: string,
  locale: EmailLocale,
): string => {
  const cents = getNumber(payload, key);
  if (cents === null) return "";

  return new Intl.NumberFormat(INTL_LOCALES[locale], {
    style: "currency",
    currency: CURRENCY,
  }).format(cents / 100);
};

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
