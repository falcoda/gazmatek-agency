export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

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
} as const;
