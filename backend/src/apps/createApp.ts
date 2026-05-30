import { config } from "@src/helpers/config";
import { NODE_ENV } from "@src/helpers/constants";
import { ERROR_MESSAGES } from "@src/helpers/error/constants";
import { ErrorHandler } from "@src/helpers/error/errorHandler";
import { NotFoundError } from "@src/helpers/error/errors";
import { metricsHandler, requestMetricsMiddleware } from "@src/helpers/metrics";
import { setupSwagger } from "@src/helpers/swagger";
import { requestContextMiddleware } from "@src/middleware/observability/requestContext";
import { requestLoggerMiddleware } from "@src/middleware/observability/requestLogger";
import { metricsRateLimiter } from "@src/middleware/security/rateLimit";
import routes from "@src/routes";
import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import helmet from "helmet";

export const createApp = (): Express => {
  const app: Express = express();

  app.use(requestContextMiddleware);
  app.use(requestLoggerMiddleware);

  if (config.metrics.enabled) {
    app.use(requestMetricsMiddleware);
  }

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:"],
          objectSrc: ["'none'"],
          frameSrc: ["'self'"],
        },
      },
    }),
  );

  app.use(cors({ origin: config.server.corsOrigin, credentials: true }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    express.json({
      // Capture rawBody for HMAC signature verification (Documenso webhook).
      verify: (req, _res, buffer) => {
        (req as Request & { rawBody?: string }).rawBody =
          buffer.toString("utf8");
      },
    }),
  );

  if (config.server.trustProxy && config.nodeEnv !== NODE_ENV.TEST) {
    app.set("trust proxy", true);
  }

  if (config.metrics.enabled) {
    app.get(config.metrics.path, metricsRateLimiter, metricsHandler);
  }

  app.use("/api", routes);

  setupSwagger(app);

  app.use((req: Request, _res: Response, next: NextFunction): void => {
    next(
      new NotFoundError(ERROR_MESSAGES.ROUTE_NOT_FOUND, {
        requestId: req.requestId,
      }),
    );
  });

  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    ErrorHandler.handle(err, req, res);
  });

  return app;
};
