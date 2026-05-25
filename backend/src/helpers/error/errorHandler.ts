import { ERROR_MESSAGES, HTTP_STATUS } from "@src/helpers/error/constants";
import { AppError } from "@src/helpers/error/errors";
import { logger } from "@src/helpers/logger";
import { Request, Response } from "express";

export class ErrorHandler {
  static handle(error: Error, req: Request, res: Response): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        message: error.message,
        details: error.details,
        requestId: req.requestId,
      });
      return;
    }

    logger.error(ERROR_MESSAGES.UNHANDLED_ERROR, {
      error: error.message,
      stack: error.stack,
      request_id: req.requestId,
    });

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      requestId: req.requestId,
    });
  }
}

export default ErrorHandler;
