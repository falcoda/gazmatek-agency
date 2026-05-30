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

/** French labels shown in the admin back-office (S-42). */
export const BOOKING_STATUS_LABEL_FR: Record<BookingStatus, string> = {
  pending_validation: "En attente de validation",
  awaiting_deposit: "En attente d'acompte",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  completed: "Terminé",
};

/** Short single-word labels used inside table badges. */
export const BOOKING_STATUS_SHORT_LABEL_FR: Record<BookingStatus, string> = {
  pending_validation: "Validation",
  awaiting_deposit: "Acompte",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  completed: "Terminé",
};

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
