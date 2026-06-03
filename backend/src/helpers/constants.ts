export const NODE_ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

export const AUTH_HEADERS = {
  BEARER_PREFIX: "Bearer ",
  API_KEY_PREFIX: "ApiKey ",
  TOKEN_COOKIE_KEY: "token=",
} as const;

export const HEALTH_STATUS = {
  ALIVE: "alive",
  READY: "ready",
} as const;

export const STORAGE_ERROR_CODES = {
  NOT_FOUND: "ENOENT",
} as const;

export const JWT_EXPIRES = {
  ACCESS: "15m",
  REFRESH_DAYS: 7,
} as const;

// httpOnly cookie names per identity actor (admin / artist / client). The access
// token is also accepted via `Authorization: Bearer` for non-browser clients;
// refresh tokens are cookie-only. Distinct names so the three actors never
// clobber each other in the same browser.
export const AUTH_COOKIES = {
  ADMIN: { ACCESS: "admin_token", REFRESH: "admin_refresh_token" },
  ARTIST: { ACCESS: "artist_token", REFRESH: "artist_refresh_token" },
  CLIENT: { ACCESS: "client_token", REFRESH: "client_refresh_token" },
} as const;

// Single source of truth for the identity (admin/artist/client) token lifetimes.
// The JWT `expiresIn` (helpers/auth/identity.ts), the access-cookie Max-Age
// (helpers/authCookies.ts) and the refresh-token TTL
// (services/auth/identityRefreshService.ts) all derive from this so they can
// never drift. (Distinct from the legacy single-user JWT_EXPIRES above.)
export const IDENTITY_TOKEN_EXPIRES = {
  ACCESS_MINUTES: 720, // 12h — preserves the current identity-token lifetime
  REFRESH_DAYS: 30,
} as const;

// Mount point for the HTTP API router. Shared so the frontend SPA fallback can
// exclude API routes from the index.html catch-all.
export const API_PREFIX = "/api";

// Entry document of the built frontend single-page application.
export const FRONTEND_INDEX_FILE = "index.html";

// URL prefix under which Vite serves the hashed frontend assets (JS, CSS,
// fonts, images). Requests to these paths are noise in the HTTP access log, so
// the request logger skips them.
export const FRONTEND_ASSETS_PREFIX = "/assets/";
