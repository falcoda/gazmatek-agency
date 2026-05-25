import { ERROR_MESSAGES, HTTP_STATUS } from "@src/helpers/error/constants";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.VALIDATION_ERROR,
    details?: unknown,
  ) {
    super(HTTP_STATUS.BAD_REQUEST, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.RESOURCE_NOT_FOUND,
    details?: unknown,
  ) {
    super(HTTP_STATUS.NOT_FOUND, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.UNAUTHORIZED,
    details?: unknown,
  ) {
    super(HTTP_STATUS.UNAUTHORIZED, message, details);
  }
}

export class ExpiredTokenError extends AppError {
  constructor(message: string = ERROR_MESSAGES.TOKEN_EXPIRED) {
    super(HTTP_STATUS.UNAUTHORIZED, message, { resetToken: true });
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = ERROR_MESSAGES.FORBIDDEN, details?: unknown) {
    super(HTTP_STATUS.FORBIDDEN, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = ERROR_MESSAGES.CONFLICT, details?: unknown) {
    super(HTTP_STATUS.CONFLICT, message, details);
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.DATABASE_ERROR,
    details?: unknown,
  ) {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, details);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.SERVICE_UNAVAILABLE,
    details?: unknown,
  ) {
    super(HTTP_STATUS.SERVICE_UNAVAILABLE, message, details);
  }
}

export class InternalError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    details?: unknown,
  ) {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, details);
  }
}
