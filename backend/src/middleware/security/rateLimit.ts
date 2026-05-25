import { config } from "@src/helpers/config";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

const createLimiter = (max: number, message: string): RateLimitRequestHandler =>
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message },
  });

export const apiRateLimiter = createLimiter(
  config.rateLimit.maxApi,
  "Too many API requests",
);

export const authRateLimiter = createLimiter(
  config.rateLimit.maxAuth,
  "Too many authentication requests, please try again later",
);

export const docsRateLimiter = createLimiter(
  config.rateLimit.maxDocs,
  "Too many documentation requests",
);

export const metricsRateLimiter = createLimiter(
  config.rateLimit.maxMetrics,
  "Too many metrics requests",
);
