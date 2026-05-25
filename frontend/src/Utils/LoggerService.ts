export enum LogTag {
  APP = "APP",
  AUTH = "AUTH",
  STORE = "STORE",
  API = "API",
  UI = "UI",
  HOOK = "HOOK",
}

type LogLevel = "debug" | "info" | "warn" | "error";

const isDev = import.meta.env.DEV;

function formatMessage(tag: LogTag, message: string): string {
  return `[${tag}] ${message}`;
}

function log(
  level: LogLevel,
  tag: LogTag,
  message: string,
  ...args: unknown[]
) {
  if (!isDev && level === "debug") return;

  const formatted = formatMessage(tag, message);

  switch (level) {
    case "debug":
      console.debug(formatted, ...args);
      break;
    case "info":
      console.info(formatted, ...args);
      break;
    case "warn":
      console.warn(formatted, ...args);
      break;
    case "error":
      console.error(formatted, ...args);
      break;
  }
}

export const loggerService = {
  debug: (tag: LogTag, message: string, ...args: unknown[]) =>
    log("debug", tag, message, ...args),
  info: (tag: LogTag, message: string, ...args: unknown[]) =>
    log("info", tag, message, ...args),
  warn: (tag: LogTag, message: string, ...args: unknown[]) =>
    log("warn", tag, message, ...args),
  error: (tag: LogTag, message: string, ...args: unknown[]) =>
    log("error", tag, message, ...args),
};
