/**
 * Shared client-side auth constants used by the token handling utilities so
 * session persistence and token refresh stay consistent across the app.
 */

/** localStorage keys holding the persisted auth session. */
export const AUTH_STORAGE_KEYS = {
  USER_SESSION: "websiteTemplate.auth.session",
} as const;

/**
 * Seconds of leeway before the real JWT expiry at which an access token is
 * already treated as expired, so it gets refreshed proactively before a
 * request rather than failing with a 401.
 */
export const TOKEN_EXPIRY_LEEWAY_SECONDS = 15;
