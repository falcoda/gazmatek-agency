import { startApi } from "@src/apps/api";
import { createApp } from "@src/apps/createApp";
import { config } from "@src/helpers/config";
import { NODE_ENV } from "@src/helpers/constants";
import { logger } from "@src/helpers/logger";

export { createApp };

if (config.nodeEnv !== NODE_ENV.TEST) {
  void startApi().catch((error: Error) => {
    logger.error("Failed to start API", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });
}
