/**
 * Machine-readable error codes the backend returns so the client can localize
 * failures instead of surfacing raw English messages. Mirrors
 * `backend/src/helpers/error/constants.ts` — keep both sides in sync.
 *
 * Where each code travels in the error body:
 * - auth codes: in the `message` field of a `401`/`403` response;
 * - booking codes: in the `details.code` field.
 */
export const AUTH_ERROR_CODES = {
  MISSING_TOKEN: "AUTH_MISSING_TOKEN",
  INVALID_TOKEN: "AUTH_INVALID_TOKEN",
  FORBIDDEN_KIND: "AUTH_FORBIDDEN_KIND",
  USER_DISABLED: "AUTH_USER_DISABLED",
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

export const BOOKING_ERROR_CODES = {
  LEAD_TIME_TOO_SHORT: "BOOKING_LEAD_TIME_TOO_SHORT",
  UNKNOWN_OPTION: "BOOKING_UNKNOWN_OPTION",
  DEPOSIT_EXCEEDS_TOTAL: "BOOKING_DEPOSIT_EXCEEDS_TOTAL",
  ARTIST_NOT_ONBOARDED: "ARTIST_NOT_ONBOARDED",
} as const;

export type BookingErrorCode =
  (typeof BOOKING_ERROR_CODES)[keyof typeof BOOKING_ERROR_CODES];
