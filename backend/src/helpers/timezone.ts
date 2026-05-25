/**
 * Timezone helpers.
 *
 * The app stores timestamps as absolute instants but sometimes has to reconcile
 * them with zone-less wall-clock values — times typed by a user, calendar-day
 * grouping, report labels. Every such conversion goes through this module so the
 * interpreting timezone (`config.app.timezone`) is applied consistently, never
 * the server's own timezone.
 */

interface ZonedParts {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
}

/** Wall-clock calendar/time parts of `instant` as seen in `timeZone`. */
const getZonedParts = (instant: Date, timeZone: string): ZonedParts => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const lookup: Record<string, string> = {};
  for (const part of formatter.formatToParts(instant)) {
    if (part.type !== "literal") {
      lookup[part.type] = part.value;
    }
  }

  return {
    year: lookup.year,
    month: lookup.month,
    day: lookup.day,
    // Some ICU builds emit "24" for midnight under the h23 cycle.
    hour: lookup.hour === "24" ? "00" : lookup.hour,
    minute: lookup.minute,
    second: lookup.second,
  };
};

/**
 * Offset, in milliseconds, between an absolute instant and the wall clock of
 * `timeZone` at that instant (positive when the zone is ahead of UTC).
 */
export const getTimeZoneOffsetMs = (
  timeZone: string,
  instant: Date,
): number => {
  const parts = getZonedParts(instant, timeZone);
  const wallClockAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return wallClockAsUtc - instant.getTime();
};

/**
 * Resolve a wall-clock time expressed in `timeZone` into an absolute instant.
 *
 * Wall-clock values are stored without a zone; comparing them with absolute
 * timestamps requires interpreting them in a known timezone first.
 */
export const zonedWallClockToInstant = (
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  timeZone: string,
): Date => {
  const naiveUtc = Date.UTC(year, month - 1, day, hours, minutes, 0);
  // The offset can change with DST, so resolve it twice: the second pass uses
  // the offset that actually applies at the resolved instant.
  const firstGuess =
    naiveUtc - getTimeZoneOffsetMs(timeZone, new Date(naiveUtc));
  const offset = getTimeZoneOffsetMs(timeZone, new Date(firstGuess));

  return new Date(naiveUtc - offset);
};

/** Calendar day of `instant` in `timeZone`, as `YYYY-MM-DD`. */
export const formatZonedDate = (instant: Date, timeZone: string): string => {
  const parts = getZonedParts(instant, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
};

/** Wall-clock time of `instant` in `timeZone`, as `HH:MM`. */
export const formatZonedTime = (instant: Date, timeZone: string): string => {
  const parts = getZonedParts(instant, timeZone);
  return `${parts.hour}:${parts.minute}`;
};
