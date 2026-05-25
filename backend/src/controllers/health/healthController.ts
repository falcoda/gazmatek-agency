import { checkDatabaseReady } from "@src/db/query/health/checkDatabaseReady";
import { config } from "@src/helpers/config";
import { HEALTH_STATUS } from "@src/helpers/constants";
import { ServiceUnavailableError } from "@src/helpers/error/errors";
import { NextFunction, Request, Response } from "express";
import { Pool } from "pg";

export class HealthController {
  constructor(private db: Pool) {}

  live(_req: Request, res: Response) {
    res.status(200).json({
      status: HEALTH_STATUS.ALIVE,
      service: config.app.name,
      version: config.app.version,
      uptime_seconds: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  async ready(_req: Request, res: Response, next: NextFunction) {
    try {
      const databaseReady = await checkDatabaseReady(this.db);
      const checks = {
        database: databaseReady,
      };

      if (!checks.database) {
        next(
          new ServiceUnavailableError("Service is not ready", {
            checks,
          }),
        );
        return;
      }

      res.status(200).json({
        status: HEALTH_STATUS.READY,
        checks,
      });
    } catch (error) {
      const err = error as Error;
      next(
        new ServiceUnavailableError("Service is not ready", {
          checks: {
            database: false,
          },
          cause: err.message,
        }),
      );
    }
  }

  async details(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        service: config.app.name,
        version: config.app.version,
        request_id: req.requestId,
        docs_enabled: config.docs.enabled,
        metrics_enabled: config.metrics.enabled,
        mailer_enabled: config.mailer.enabled,
        auth_strategies: config.auth.strategies,
        feature_flags: config.featureFlags,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default HealthController;
