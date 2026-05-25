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
