import type { TFunction } from "i18next";

export type BookingStatus =
  | "pending_validation"
  | "awaiting_deposit"
  | "confirmed"
  | "cancelled"
  | "completed";

export const BOOKING_STATUSES: readonly BookingStatus[] = [
  "pending_validation",
  "awaiting_deposit",
  "confirmed",
  "cancelled",
  "completed",
] as const;

/**
 * Localized label for a booking status. Resolves `booking.status.<status>` from
 * the active locale (fr/nl/en) and falls back to the raw status code for any
 * value not covered by the enum.
 */
export function bookingStatusLabel(t: TFunction, status: string): string {
  const key = `booking.status.${status}`;
  const label = t(key);
  return label === key ? status : label;
}

export type BookingStatusTone =
  | "warning"
  | "info"
  | "success"
  | "danger"
  | "neutral";

export const BOOKING_STATUS_TONE: Record<BookingStatus, BookingStatusTone> = {
  pending_validation: "warning",
  awaiting_deposit: "info",
  confirmed: "success",
  cancelled: "danger",
  completed: "neutral",
};
