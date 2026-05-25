import { closeDB, connectDB } from "@src/db/dbConnect";
import { config } from "@src/helpers/config";
import {
  registerProcessSignalHandlers,
  registerShutdownTask,
} from "@src/helpers/lifecycle";
import { logger } from "@src/helpers/logger";
import { startScheduler, stopScheduler } from "@src/jobs/scheduler";
import { closeMailerService } from "@src/services/mailer";
import { closeNotificationService } from "@src/services/notifications";
import { closeStorageService } from "@src/services/storage";
import { Server } from "http";

import { createApp } from "./createApp";

export const startApi = async () => {
  const app = createApp();
  await connectDB();
  startScheduler();

  const server: Server = app.listen(config.server.port, () => {
    logger.info("API server started", {
      port: config.server.port,
      docs_path: config.docs.enabled ? config.docs.path : null,
      metrics_path: config.metrics.enabled ? config.metrics.path : null,
    });
  });

  registerShutdownTask("database-pool", closeDB);
  registerShutdownTask("storage-service", closeStorageService);
  registerShutdownTask("notification-service", closeNotificationService);
  registerShutdownTask("mailer-service", closeMailerService);
  registerShutdownTask("job-scheduler", stopScheduler);
  registerShutdownTask("http-server", async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  });
  registerProcessSignalHandlers();

  return { app, server };
};
