const DAY_IN_MS = 24 * 60 * 60 * 1000;

function padDateUnit(value: number) {
  return String(value).padStart(2, "0");
}

/**
 * Normalizes a date value to a `Date` anchored at midday, which avoids
 * timezone-related off-by-one issues when only the calendar day matters.
 */
export function normalizeDateValue(value: Date | string) {
  if (typeof value === "string") {
    const matchedDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (matchedDate) {
      const [, year, month, day] = matchedDate;
      const nextDate = new Date(Number(year), Number(month) - 1, Number(day));
      nextDate.setHours(12, 0, 0, 0);
      return nextDate;
    }
  }

  const nextDate = new Date(value);
  nextDate.setHours(12, 0, 0, 0);
  return nextDate;
}

/** Serializes a date to the `YYYY-MM-DD` format used by `<input type="date">`. */
export function formatDateInputValue(value: Date) {
  const date = normalizeDateValue(value);

  return `${date.getFullYear()}-${padDateUnit(date.getMonth() + 1)}-${padDateUnit(date.getDate())}`;
}

/** Parses a value coming from an `<input type="date">` into a `Date`. */
export function parseDateInputValue(value: string) {
  return normalizeDateValue(value);
}

/** Returns a new `Date` offset by the given number of days. */
export function addDaysToDate(value: Date | string, days: number) {
  const nextDate = normalizeDateValue(value);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

/** Returns the whole-day span between two dates (never negative). */
export function getCalendarDaySpan(startDate: Date, endDate: Date) {
  const start = normalizeDateValue(startDate);
  const end = normalizeDateValue(endDate);

  return Math.max(0, Math.round((end.getTime() - start.getTime()) / DAY_IN_MS));
}

/** Formats a date for display (e.g. `05 Jan 2026`) using the given locale. */
export function formatDisplayDate(value: Date | string, locale?: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(normalizeDateValue(value));
}

/**
 * Returns the start (00:00:00.000) and end (23:59:59.999) boundaries of the
 * day range covered by the given start and end values.
 */
export function getFullDayRange(
  startValue: Date | string,
  endValue: Date | string,
) {
  const start = normalizeDateValue(startValue);
  const end = normalizeDateValue(endValue);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Applies a `HH:mm` time string to a date, optionally shifting by `dayOffset`
 * days. Invalid time parts fall back to `0`.
 */
export function setTimeOnDate(
  value: Date | string,
  timeValue: string,
  dayOffset = 0,
) {
  const nextDate = normalizeDateValue(value);
  const [hours, minutes] = timeValue.split(":").map((part) => Number(part));

  nextDate.setHours(
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0,
  );
  nextDate.setDate(nextDate.getDate() + dayOffset);

  return nextDate;
}

/** Serializes a date to the `HH:mm` format used by `<input type="time">`. */
export function formatTimeInputValue(value: Date | string) {
  const date = new Date(value);

  return `${padDateUnit(date.getHours())}:${padDateUnit(date.getMinutes())}`;
}

/** Formats a time for display (e.g. `14:30`) using the given locale. */
export function formatDisplayTime(value: Date | string, locale?: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
