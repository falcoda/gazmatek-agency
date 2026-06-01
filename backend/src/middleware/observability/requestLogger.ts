import { FRONTEND_ASSETS_PREFIX } from "@src/helpers/constants";
import { logger } from "@src/helpers/logger";
import { RequestHandler } from "express";

export const requestLoggerMiddleware: RequestHandler = (req, res, next) => {
  // Skip the hashed frontend assets: they flood the access log on every page
  // load and carry no useful signal.
  if (req.path.startsWith(FRONTEND_ASSETS_PREFIX)) {
    next();
    return;
  }

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
