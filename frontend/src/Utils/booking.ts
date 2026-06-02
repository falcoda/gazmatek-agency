/**
 * Minimum lead time (in hours) between "now" and an event date. Mirrors the
 * backend `MIN_LEAD_TIME_HOURS` so the client can pre-empt the lead-time
 * rejection (datetime-local `min`, hidden cancel buttons, …).
 */
export const MIN_BOOKING_LEAD_HOURS = 48;

/**
 * Builds the `min` attribute value for a `<input type="datetime-local">` so the
 * earliest selectable slot already respects the booking lead time. Returns a
 * LOCAL `YYYY-MM-DDTHH:mm` string. (#31)
 */
export function minBookingDateTimeLocal(
  leadHours: number = MIN_BOOKING_LEAD_HOURS,
  now: Date = new Date(),
): string {
  const earliest = new Date(now.getTime() + leadHours * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${earliest.getFullYear()}-${pad(earliest.getMonth() + 1)}-${pad(earliest.getDate())}` +
    `T${pad(earliest.getHours())}:${pad(earliest.getMinutes())}`
  );
}

/**
 * Outstanding balance for a booking: the quoted total minus the deposit
 * already accounted for, never negative.
 */
export function computeRemainingCents(
  quotedTotalCents: number,
  depositAmountCents: number,
): number {
  return Math.max(quotedTotalCents - depositAmountCents, 0);
}
