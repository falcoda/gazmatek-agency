/**
 * @file modules/logger/logger.ts
 * @description Provides a logger utility using the Winston library.
 */

import path from "path";
import { createLogger, format, Logger, transports } from "winston";
import { getSharedLibConfig } from "../../core";

let loggerInstance: Logger;

/**
 * @function safeStringify
 * @description Safely stringifies objects, handling circular references.
 * @param {unknown} obj - The object to stringify.
 * @param {number} [space] - Optional indentation for formatting.
 * @returns {string} The stringified object.
 */
function safeStringify(obj: unknown, space?: number): string {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (_key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]"; // Replace circular reference with this string
        }
        seen.add(value);
      }
      return value;
    },
    space,
  );
}

/**
 * @function getLogger
 * @description Returns a singleton logger instance.
 * @returns {Logger} The logger instance.
 */
export const getLogger = (): Logger => {
  if (loggerInstance) return loggerInstance;

  const config = getSharedLibConfig();

  // If no logger config, fallback to default
  if (!config.logger) {
    console.warn(
      "[logger] Logger config not provided. Using default console logger.",
    );
    loggerInstance = createLogger({
      level: "info",
      format: format.combine(format.colorize(), format.simple()),
      transports: [new transports.Console()],
    });
    return loggerInstance;
  }

  const logLevel = config.logger.logLevel || "info";

  loggerInstance = createLogger({
    level: logLevel,
    format: format.combine(
      format.colorize(),
      format.printf((info) => {
        // Handle JSON objects and expand them correctly
        const expandedMessage =
          Object.keys(info)
            .reverse()
            .reduce((acc, key, i) => {
              const value = info[key];
              let formattedValue;

              if (typeof value === "object" && value !== null) {
                formattedValue = safeStringify(value, 2); // Use safeStringify to avoid circular structures
              } else {
                formattedValue = String(value);
              }

              if (i > 0) acc += ", ";
              acc += `"${key}": ${formattedValue}`;
              return acc;
            }, "{ ") + " }";

        return expandedMessage;
      }),
    ),
    transports: [new transports.Console()],
  });

  if (config.logger.logPath) {
    loggerInstance.add(
      new transports.File({
        filename: path.join(config.logger.logPath, "app.log"),
        format: format.combine(format.uncolorize(), format.json()),
      }),
    );
  }

  return loggerInstance;
};
