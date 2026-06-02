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

// Maximum supported event duration in hours, by booking surface.
// The public client flow is capped tighter than the admin manual flow: an admin
// may register an off-platform multi-day engagement, a public visitor may not.
export const MAX_DURATION_HOURS_PUBLIC = 24;
export const MAX_DURATION_HOURS_ADMIN = 48;

// Booking statuses considered "active" for slot-occupation purposes: they hold
// the artist's time and therefore conflict with new bookings and unavailability.
// `pending_validation` is intentionally included for the INTERNAL conflict guard
// (we don't want two pending requests double-booked) but is excluded from the
// PUBLIC availability view (see PUBLIC_BUSY_BOOKING_STATUSES) so unreviewed
// requests don't leak through the public calendar.
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  BOOKING_STATUS.PENDING_VALIDATION,
  BOOKING_STATUS.AWAITING_DEPOSIT,
  BOOKING_STATUS.CONFIRMED,
];

// Statuses that mark a day busy on the PUBLIC availability calendar. Excludes
// `pending_validation` so pending requests are not disclosed publicly (#17).
export const PUBLIC_BUSY_BOOKING_STATUSES: BookingStatus[] = [
  BOOKING_STATUS.AWAITING_DEPOSIT,
  BOOKING_STATUS.CONFIRMED,
];

// Server-side catalogue of bookable options. Prices are authoritative: the
// quote engine looks up priceCents by id here and ignores any client-supplied
// price (#20). Add new options here, never trust the request body for pricing.
export interface BookingOptionDefinition {
  id: string;
  priceCents: number;
}

export const BOOKING_OPTIONS_CATALOGUE: Readonly<
  Record<string, BookingOptionDefinition>
> = {
  sound_system: { id: "sound_system", priceCents: 50_000 },
  lighting: { id: "lighting", priceCents: 35_000 },
  mc_host: { id: "mc_host", priceCents: 25_000 },
  extra_hour: { id: "extra_hour", priceCents: 20_000 },
} as const;

// Resolve a list of option ids against the server-side catalogue, returning the
// authoritative total cost in cents. Unknown ids are reported back so the caller
// can reject the request rather than silently dropping the option (#20).
export function resolveOptionsCostCents(optionIds: string[]): {
  optionsCostCents: number;
  unknownIds: string[];
} {
  let optionsCostCents = 0;
  const unknownIds: string[] = [];
  for (const id of optionIds) {
    const definition = BOOKING_OPTIONS_CATALOGUE[id];
    if (!definition) {
      unknownIds.push(id);
      continue;
    }
    optionsCostCents += definition.priceCents;
  }
  return { optionsCostCents, unknownIds };
}

// Status → supporting timestamps an admin manual booking must carry so a
// confirmed/completed booking is never left with NULL paid_at /
// admin_approved_at (#8). `derivesAdminApproved` stamps admin_approved_at;
// `derivesPaid` stamps paid_at. Centralized so the rule has one home.
export function deriveAdminBookingTimestamps(status: BookingStatus): {
  derivesAdminApproved: boolean;
  derivesPaid: boolean;
} {
  const derivesAdminApproved =
    status === BOOKING_STATUS.AWAITING_DEPOSIT ||
    status === BOOKING_STATUS.CONFIRMED ||
    status === BOOKING_STATUS.COMPLETED;
  const derivesPaid = status === BOOKING_STATUS.COMPLETED;
  return { derivesAdminApproved, derivesPaid };
}
