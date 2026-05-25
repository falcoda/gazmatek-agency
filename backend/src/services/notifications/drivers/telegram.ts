import { notifyTeam } from "@lib/modules/notifier";
import {
  NotificationPayload,
  NotificationService,
} from "@src/services/notifications/types";

export class TelegramNotificationService implements NotificationService {
  async notify(payload: NotificationPayload): Promise<void> {
    await notifyTeam(`${payload.title}\n${payload.message}`);
  }

  async close(): Promise<void> {
    return;
  }
}
