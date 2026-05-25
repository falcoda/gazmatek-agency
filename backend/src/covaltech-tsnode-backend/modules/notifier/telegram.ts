/**
 * @file modules/notifier/telegram.ts
 * @description Handles Telegram notifications for the project.
 */

import axios from "axios";
import { NodeEnv } from "../../const";
import { getSharedLibConfig } from "../../core/config";
import { getLogger } from "../logger/logger";

const logger = getLogger();
const notificationCache: { [key: string]: number } = {};

/**
 * @function cleanNotificationCache
 * @description Cleans up the notification cache based on the throttle interval.
 * @param {number} throttleInterval - The interval in milliseconds to retain cache entries.
 */
function cleanNotificationCache(throttleInterval: number) {
  const currentTime = Date.now();
  for (const key in notificationCache) {
    if (currentTime - notificationCache[key] > throttleInterval) {
      delete notificationCache[key];
    }
  }
}

/**
 * @function notifyTeam
 * @description Sends a notification to the team via Telegram.
 * @param {string} message - The message to send.
 */
export async function notifyTeam(message: string) {
  const { telegram, nodeEnv } = getSharedLibConfig();

  if (!telegram) {
    logger.warn(
      "[notifier] Telegram config not provided. Skipping notification.",
    );
    return;
  }

  if (nodeEnv === NodeEnv.Local) {
    logger.debug(`Notification: ${message}`);
    return;
  }

  const telegramUrl = `https://api.telegram.org/bot${telegram.botToken}/sendMessage`;
  const chatId = telegram.chatId;
  const cacheKey = message;
  const currentTime = Date.now();
  const throttleInterval = 5 * 60 * 1000; // 5 minutes

  cleanNotificationCache(throttleInterval);

  if (
    notificationCache[cacheKey] &&
    currentTime - notificationCache[cacheKey] < throttleInterval
  ) {
    logger.debug(`[notifier] Skipping duplicate notification: ${message}`);
    return;
  }

  try {
    await axios.post(telegramUrl, {
      chat_id: chatId,
      text: message,
    });
    notificationCache[cacheKey] = currentTime;
    logger.info(`[notifier] Notification sent: ${message}`);
  } catch (error) {
    logger.error("Telegram notification failed", error);
  }
}
