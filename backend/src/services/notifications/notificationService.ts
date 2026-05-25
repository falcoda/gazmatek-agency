import { config } from "@src/helpers/config";
import { LoggerNotificationService } from "@src/services/notifications/drivers/logger";
import { TelegramNotificationService } from "@src/services/notifications/drivers/telegram";
import { NotificationService } from "@src/services/notifications/types";
import { NOTIFICATION_DRIVER } from "@src/types/config";

let notificationService: NotificationService | null = null;

export const getNotificationService = (): NotificationService => {
  if (notificationService) {
    return notificationService;
  }

  if (!config.notifications.enabled) {
    notificationService = new LoggerNotificationService();
    return notificationService;
  }

  if (config.notifications.driver === NOTIFICATION_DRIVER.TELEGRAM) {
    notificationService = new TelegramNotificationService();
    return notificationService;
  }

  notificationService = new LoggerNotificationService();
  return notificationService;
};

export const closeNotificationService = async (): Promise<void> => {
  if (!notificationService) {
    return;
  }

  await notificationService.close();
  notificationService = null;
};
