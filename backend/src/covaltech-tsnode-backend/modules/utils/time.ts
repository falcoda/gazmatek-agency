/**
 * @file modules/utils/time.ts
 * @description Utility functions for handling time and date operations.
 */

/**
 * @function now
 * @description Returns the current date or a date based on the provided timestamp.
 * @param {number | string | undefined} [timestamp] - Optional timestamp to convert to a Date object.
 * @returns {Date} The resulting Date object.
 */
export function now(timestamp?: number | undefined | string): Date {
  if (timestamp) {
    return new Date(
      timestamp.toString().length === 10 ? Number(timestamp) * 1000 : timestamp,
    );
  } else {
    return new Date();
  }
}

/**
 * @function nowGetTime
 * @description Returns the current time in milliseconds or the time based on the provided timestamp.
 * @param {number | string} [timestamp] - Optional timestamp to convert to milliseconds.
 * @returns {number} The resulting time in milliseconds.
 */
export function nowGetTime(timestamp?: number | string): number {
  if (timestamp) {
    return new Date(
      timestamp.toString().length === 10 ? Number(timestamp) * 1000 : timestamp,
    ).getTime();
  } else {
    return new Date().getTime();
  }
}

/**
 * @function secondToDays
 * @description Converts seconds to days.
 * @param {number} seconds - The number of seconds to convert.
 * @returns {number} The equivalent number of days.
 */
export function secondToDays(seconds: number): number {
  return seconds / 60 / 60 / 24;
}

/**
 * @function secondToReadableDate
 * @description Converts seconds to a human-readable date string.
 * @param {number} seconds - The number of seconds since the epoch.
 * @param {boolean} [showTime=true] - Whether to include the time in the output.
 * @returns {string} The formatted date string.
 */
export function secondToReadableDate(seconds: number, showTime = true): string {
  const options: Intl.DateTimeFormatOptions = showTime
    ? {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    : { year: "numeric", month: "2-digit", day: "2-digit" };

  return new Date(seconds * 1000).toLocaleDateString(undefined, options);
}

/**
 * @constant ONE_YEAR
 * @description Represents the number of milliseconds in one year.
 */
export const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;

/**
 * @constant IN_ONE_YEAR
 * @description Represents the timestamp for one year from now.
 */
export const IN_ONE_YEAR = nowGetTime() + ONE_YEAR;
