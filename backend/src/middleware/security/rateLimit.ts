import { config } from "@src/helpers/config";
import type { Request } from "express";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

const createLimiter = (max: number, message: string): RateLimitRequestHandler =>
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message },
  });

// Dedicated window for endpoints that can be abused to send mail to arbitrary
// recipients. Kept independent from the global window so it stays tight even if
// the API window is loosened.
const CONTACT_WINDOW_MS = 10 * 60 * 1000;
const CONTACT_MAX = 5;

// Adds a per-email dimension on top of the IP so an attacker cannot flood a
// single victim's inbox (reset emails, contact auto-replies) by rotating IPs,
// nor repeatedly invalidate a victim's pending reset link.
const emailScopedKey = (req: Request): string => {
  const body = (req.body ?? {}) as { email?: unknown };
  const email =
    typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  return `${req.ip ?? "unknown"}:${email}`;
};

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

// Strict, dedicated limiter for the public contact endpoint: it triggers an
// outbound auto-reply to a user-supplied address, so without a tight cap a
// single IP could use it to email-bomb arbitrary victims through our domain.
export const contactRateLimiter = rateLimit({
  windowMs: CONTACT_WINDOW_MS,
  max: CONTACT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  // IP + email so the cap cannot be diluted across many target addresses.
  keyGenerator: emailScopedKey,
  validate: false,
  message: { message: "Too many contact messages, please try again later" },
});

// Per-email limiter for credential endpoints (login, forgot-password). Stacks
// on top of the global IP-based authRateLimiter to stop targeted abuse of a
// single account (reset-link flooding / invalidation, slow credential probing).
export const authAccountRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxAuth,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: emailScopedKey,
  validate: false,
  message: {
    message: "Too many authentication requests, please try again later",
  },
});
