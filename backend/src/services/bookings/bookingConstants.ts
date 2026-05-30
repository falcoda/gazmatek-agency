// Booking status lifecycle (see migration 008 for the column type):
//   pending_validation -> (admin approves) -> awaiting_deposit
//                       -> (deposit paid)   -> confirmed
//                       -> (event done)     -> completed
//                       -> (anytime)        -> cancelled
// New bookings — both the public client flow and the admin manual flow —
// start at `pending_validation`, which matches the SQL column default. The
// status is then advanced by the admin validation / deposit actions. This is
// the single source of truth consumed across the booking services.
export const BOOKING_STATUS = {
  PENDING_VALIDATION: "pending_validation",
  AWAITING_DEPOSIT: "awaiting_deposit",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

// Deposit = 30% of the quoted total.
export const DEPOSIT_PERCENTAGE_BPS = 3000;
export const BPS_DIVISOR = 10_000;

export const MIN_LEAD_TIME_HOURS = 48;
