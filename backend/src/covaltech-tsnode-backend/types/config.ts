/**
 * @file types/config.ts
 * @description Defines configuration-related TypeScript interfaces.
 */

import { NodeEnv } from "../const";

/**
 * @interface LoggerConfig
 * @description Configuration for the logger.
 */
export interface LoggerConfig {
  logLevel: string;
  logPath: string;
}

/**
 * @interface TelegramConfig
 * @description Configuration for Telegram notifications.
 */
export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

/**
 * @interface SharedLibConfig
 * @description Shared library configuration.
 */
export interface SharedLibConfig {
  nodeEnv: NodeEnv;
  logger?: LoggerConfig;
  telegram?: TelegramConfig;
  mnemonic?: string;
  database?: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
}
