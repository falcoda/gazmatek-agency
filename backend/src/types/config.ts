export const AUTH_STRATEGY = {
  JWT: "jwt",
  API_KEY: "api-key",
} as const;

export const NOTIFICATION_DRIVER = {
  LOGGER: "logger",
  TELEGRAM: "telegram",
} as const;

export const STORAGE_DRIVER = {
  LOCAL: "local",
  S3: "s3",
} as const;

export const MAIL_DRIVER = {
  LOGGER: "logger",
  SMTP: "smtp",
  DISABLED: "disabled",
} as const;

export const AUTH_STRATEGIES = [
  AUTH_STRATEGY.JWT,
  AUTH_STRATEGY.API_KEY,
] as const;
export const NOTIFICATION_DRIVERS = [
  NOTIFICATION_DRIVER.LOGGER,
  NOTIFICATION_DRIVER.TELEGRAM,
] as const;
export const STORAGE_DRIVERS = [
  STORAGE_DRIVER.LOCAL,
  STORAGE_DRIVER.S3,
] as const;
export const MAIL_DRIVERS = [
  MAIL_DRIVER.LOGGER,
  MAIL_DRIVER.SMTP,
  MAIL_DRIVER.DISABLED,
] as const;

export const LOG_LEVELS = [
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
] as const;

export type AuthStrategy = (typeof AUTH_STRATEGIES)[number];
export type NotificationDriver = (typeof NOTIFICATION_DRIVERS)[number];
export type StorageDriver = (typeof STORAGE_DRIVERS)[number];
export type MailDriver = (typeof MAIL_DRIVERS)[number];
export type LogLevel = (typeof LOG_LEVELS)[number];

export interface AppFeatureFlags {
  swagger: boolean;
  metrics: boolean;
  notifications: boolean;
  storage: boolean;
  mailer: boolean;
  jobs: boolean;
}
