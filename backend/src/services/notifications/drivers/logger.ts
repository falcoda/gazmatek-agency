import { logger } from "@src/helpers/logger";
import {
  NotificationPayload,
  NotificationService,
} from "@src/services/notifications/types";

export class LoggerNotificationService implements NotificationService {
  async notify(payload: NotificationPayload): Promise<void> {
    logger.info("Notification emitted", payload);
  }

  async close(): Promise<void> {
    return;
  }
}
