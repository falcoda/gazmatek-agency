import { logger } from "@src/helpers/logger";
import { RequestHandler } from "express";

export const requestLoggerMiddleware: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    logger.info("HTTP request completed", {
      request_id: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status_code: res.statusCode,
      duration_ms: Math.round(durationMs * 100) / 100,
    });
  });

  next();
};
