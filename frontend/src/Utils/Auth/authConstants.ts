/**
 * Shared client-side auth constants. With httpOnly cookie auth, no token ever
 * lives in JS-readable storage — only a non-sensitive identity object is cached
 * per actor for optimistic hydration on reload.
 */

/**
 * localStorage keys holding the persisted (non-sensitive) identity per actor.
 * Distinct keys so the three actors never clobber each other, and `.identity`
 * suffixed so the pre-cookie token-bearing keys are abandoned (not reused).
 */
export const AUTH_STORAGE_KEYS = {
  ADMIN: "gazmatek.adminAuth.identity",
  ARTIST: "gazmatek.artistAuth.identity",
  CLIENT: "gazmatek.clientAuth.identity",
  /** Legacy single-user session key (template scaffolding, kept for compat). */
  USER_SESSION: "websiteTemplate.auth.session",
} as const;

/**
 * Seconds of leeway before the real JWT expiry at which an access token is
 * already treated as expired. Used only by the legacy single-user `appFetch`
 * chain (template scaffolding); the cookie-based actor flows refresh reactively
 * on a 401 instead of decoding token expiry client-side.
 */
export const TOKEN_EXPIRY_LEEWAY_SECONDS = 15;
