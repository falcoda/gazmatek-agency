export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const AUTH_ERROR_CODES = {
  MISSING_TOKEN: "AUTH_MISSING_TOKEN",
  INVALID_TOKEN: "AUTH_INVALID_TOKEN",
  FORBIDDEN_KIND: "AUTH_FORBIDDEN_KIND",
  USER_DISABLED: "AUTH_USER_DISABLED",
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

// Typed, machine-readable booking error codes. The frontend localizes these;
// the human-readable message stays as the AppError message for logs/fallback.
export const BOOKING_ERROR_CODES = {
  LEAD_TIME_TOO_SHORT: "BOOKING_LEAD_TIME_TOO_SHORT",
  ARTIST_UNAVAILABLE: "BOOKING_ARTIST_UNAVAILABLE",
  UNKNOWN_OPTION: "BOOKING_UNKNOWN_OPTION",
  DEPOSIT_EXCEEDS_TOTAL: "BOOKING_DEPOSIT_EXCEEDS_TOTAL",
  ARTIST_NOT_ONBOARDED: "ARTIST_NOT_ONBOARDED",
} as const;

export type BookingErrorCode =
  (typeof BOOKING_ERROR_CODES)[keyof typeof BOOKING_ERROR_CODES];

export const ERROR_MESSAGES = {
  VALIDATION_ERROR: "Validation error",
  RESOURCE_NOT_FOUND: "Resource not found",
  ROUTE_NOT_FOUND: "Route not found",
  UNAUTHORIZED: "Unauthorized",
  TOKEN_EXPIRED: "Token expired, please log in again",
  FORBIDDEN: "Forbidden",
  CONFLICT: "Conflict",
  DATABASE_ERROR: "Database error",
  SERVICE_UNAVAILABLE: "Service unavailable",
  INTERNAL_SERVER_ERROR: "Internal server error",
  UNHANDLED_ERROR: "Unhandled error",
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_ALREADY_EXISTS: "A user with this email already exists",
  INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
  INVALID_RESET_TOKEN: "Invalid or expired reset token",
  REFRESH_TOKEN_REQUIRED: "refreshToken is required",
  INVALID_DOCUMENSO_SIGNATURE: "Invalid Documenso signature",
  MISSING_DOCUMENT_ID: "Missing document id in webhook payload",
  ENGAGEMENT_INFO_INCOMPLETE:
    "Artist profile is incomplete: full name, phone, address and country are required before signing the engagement contract",
} as const;
