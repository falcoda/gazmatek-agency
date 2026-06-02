import { getArtistById } from "@src/db/query/artist/getArtistById.types";
import { getArtistBySlug } from "@src/db/query/artist/getArtistBySlug.types";
import { createBooking } from "@src/db/query/booking/createBooking.types";
import {
  getBookingById,
  IGetBookingByIdResult,
} from "@src/db/query/booking/getBookingById.types";
import { listBookingsOverlapping } from "@src/db/query/booking/listBookingsOverlapping.types";
import { updateBookingAdmin } from "@src/db/query/booking/updateBookingAdmin.types";
import { getClientAccountById } from "@src/db/query/clientAccount/getClientAccountById.types";
import { listUnavailabilitiesInRange } from "@src/db/query/unavailability/listUnavailabilitiesInRange.types";
import { recordAudit } from "@src/helpers/audit";
import { ArtistLevel, ArtistSetType } from "@src/helpers/constants/artist";
import {
  BOOKING_STATUS,
  type BookingStatus,
} from "@src/helpers/constants/domain";
import {
  AUTH_ERROR_CODES,
  BOOKING_ERROR_CODES,
} from "@src/helpers/error/constants";
import {
  ConflictError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@src/helpers/error/errors";
import {
  BPS_DIVISOR,
  DEPOSIT_PERCENTAGE_BPS,
  deriveAdminBookingTimestamps,
  MIN_LEAD_TIME_HOURS,
  resolveOptionsCostCents,
} from "@src/services/bookings/bookingConstants";
import {
  EmailLocale,
  EmailTemplate,
  getEmailQueue,
} from "@src/services/mailer/queueService";
import { computeBookingTotal } from "@src/services/pricing/bookingTotal";
import { Pool, PoolClient } from "pg";

// Postgres error codes for the booking overlap guarantee (#5).
const PG_EXCLUSION_VIOLATION = "23P01";
const PG_UNIQUE_VIOLATION = "23505";

export interface BookingOptionInput {
  id: string;
  label?: string;
  priceCents?: number;
}

export interface CreateBookingInput {
  artistId?: string;
  artistSlug?: string;
  eventDate: string;
  durationHours: number;
  location: { address: string; lat?: number; lng?: number };
  context?: string;
  capacity: number;
  ticketPriceCents: number;
  setType: ArtistSetType;
  options: BookingOptionInput[];
  client: { email: string; name: string; phone?: string };
  clientAccountId: string;
  locale: EmailLocale;
}

export interface CreateBookingResult {
  id: string;
  status: BookingStatus;
  clientEmail: string;
}

export interface ResolvedClientAccount {
  clientId: string;
  clientEmail: string;
  clientName: string;
}

interface PricingResult {
  quotedTotalCents: number;
  depositAmountCents: number;
}

/**
 * Server-side quote: option prices are resolved from the server-side catalogue
 * (#20) — client-supplied prices are ignored and unknown ids are rejected — and
 * the total is computed by the single shared computeBookingTotal (#40) so the
 * displayed estimate and the stored quote can never drift.
 */
function computeQuote(args: {
  level: ArtistLevel;
  capacity: number;
  ticketPriceCents: number;
  setType: ArtistSetType;
  options: BookingOptionInput[];
}): PricingResult {
  const { optionsCostCents, unknownIds } = resolveOptionsCostCents(
    args.options.map((o) => o.id),
  );
  if (unknownIds.length > 0) {
    throw new ValidationError("Unknown booking option(s)", {
      code: BOOKING_ERROR_CODES.UNKNOWN_OPTION,
      unknownIds,
    });
  }

  const { totalCents } = computeBookingTotal({
    level: args.level,
    capacity: args.capacity,
    ticketPriceCents: args.ticketPriceCents,
    setType: args.setType,
    optionsCostCents,
  });
  const depositAmountCents = Math.round(
    (totalCents * DEPOSIT_PERCENTAGE_BPS) / BPS_DIVISOR,
  );
  return { quotedTotalCents: totalCents, depositAmountCents };
}

// Translate the DB-level overlap guarantee (#5) into a friendly ConflictError.
function isOverlapViolation(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === PG_EXCLUSION_VIOLATION || code === PG_UNIQUE_VIOLATION;
}

export class BookingService {
  constructor(private db: Pool) {}

  /**
   * Resolves a client account from its id and derives a display name.
   * Kept in the service so controllers never touch the DB directly (Rule 1).
   */
  async resolveClientAccount(clientId: string): Promise<ResolvedClientAccount> {
    const rows = await getClientAccountById.run({ clientId }, this.db);
    const account = rows[0];
    if (!account || !account.email) {
      throw new UnauthorizedError(AUTH_ERROR_CODES.MISSING_TOKEN);
    }
    const clientEmail = account.email;
    const clientName =
      account.display_name ?? clientEmail.split("@")[0] ?? "Client";
    return { clientId, clientEmail, clientName };
  }

  async create(input: CreateBookingInput): Promise<CreateBookingResult> {
    const eventDate = new Date(input.eventDate);
    const now = new Date();
    const leadTimeMs = MIN_LEAD_TIME_HOURS * 60 * 60 * 1000;
    if (eventDate.getTime() <= now.getTime() + leadTimeMs) {
      // Typed code (#46) so the frontend can localize; human message kept too.
      throw new ValidationError(
        `Event date must be at least ${MIN_LEAD_TIME_HOURS} hours in the future`,
        {
          code: BOOKING_ERROR_CODES.LEAD_TIME_TOO_SHORT,
          minLeadTimeHours: MIN_LEAD_TIME_HOURS,
        },
      );
    }

    const artistRows = input.artistId
      ? await getArtistById.run({ artistId: input.artistId }, this.db)
      : input.artistSlug
        ? await getArtistBySlug.run({ slug: input.artistSlug }, this.db)
        : [];
    if (artistRows.length === 0) {
      throw new NotFoundError("Artist not found");
    }
    const artist = artistRows[0];

    const eventEnd = new Date(
      eventDate.getTime() + input.durationHours * 60 * 60 * 1000,
    );

    // Quote first (rejects unknown options before touching the DB).
    const { quotedTotalCents, depositAmountCents } = computeQuote({
      level: artist.level as ArtistLevel,
      capacity: input.capacity,
      ticketPriceCents: input.ticketPriceCents,
      setType: input.setType,
      options: input.options,
    });

    // Atomic check-then-insert (#5): run the overlap/unavailability guard and
    // the insert inside one transaction, and let the EXCLUDE constraint be the
    // final authority against a concurrent racing insert.
    const booking = await this.withTransaction(async (client) => {
      await this.assertSlotFree(client, artist.id, eventDate, eventEnd);

      const created = await createBooking.run(
        {
          artistId: artist.id,
          clientAccountId: input.clientAccountId,
          clientLocale: input.locale,
          eventDate,
          eventDurationHours: input.durationHours,
          eventLocationAddress: input.location.address,
          eventLocationLat: input.location.lat ?? null,
          eventLocationLng: input.location.lng ?? null,
          eventContext: input.context ?? null,
          capacity: input.capacity,
          ticketPriceCents: input.ticketPriceCents,
          setType: input.setType,
          options: JSON.stringify(input.options),
          quotedTotalCents,
          depositAmountCents,
          // Explicit initial status. The SQL default COALESCEs to
          // `pending_validation`; we surface that here via the constant.
          status: BOOKING_STATUS.PENDING_VALIDATION,
          adminApprovedAt: null,
          paidAt: null,
        },
        client,
      );
      if (created.length === 0) {
        throw new InternalError("Booking insert failed");
      }
      return created[0];
    });

    // Non-blocking recap so the client has a written trace of their request.
    await getEmailQueue().enqueue({
      template: EmailTemplate.BOOKING_CONFIRMATION,
      recipient: input.client.email,
      locale: input.locale,
      payload: {
        clientName: input.client.name,
        artistStageName: artist.stage_name,
        eventDate: eventDate.toISOString(),
        quotedTotalCents,
        depositAmountCents,
      },
    });

    await recordAudit({
      actorKind: "client",
      action: "booking.create",
      targetKind: "booking",
      targetId: booking.id,
      metadata: { artistId: artist.id, quotedTotalCents },
    });

    return {
      id: booking.id,
      status: booking.status,
      clientEmail: input.client.email,
    };
  }

  /**
   * Admin-driven booking creation. Differs from create() in three ways:
   *   1. The admin picks the initial status (default `pending_validation`).
   *   2. Pricing and conflict checks can be overridden — the admin has talked
   *      to the artist and client and knows the deal.
   *   3. The lead-time guard is skipped so an admin can register a past event
   *      that was agreed off-platform.
   * Email confirmation is opt-out via skipEmails.
   */
  async createForAdmin(input: {
    artistId: string;
    clientAccountId: string;
    client: { email: string | null; name: string; phone: string | null };
    eventDate: string;
    durationHours: number;
    locationAddress: string;
    context?: string;
    capacity: number;
    ticketPriceCents: number;
    setType: ArtistSetType;
    initialStatus?: string;
    quotedTotalCents?: number;
    depositAmountCents?: number;
    internalNote?: string;
    skipEmails?: boolean;
    overrideConflict?: boolean;
    locale: EmailLocale;
  }): Promise<CreateBookingResult> {
    const eventDate = new Date(input.eventDate);

    const artistRows = await getArtistById.run(
      { artistId: input.artistId },
      this.db,
    );
    if (artistRows.length === 0) {
      throw new NotFoundError("Artist not found");
    }
    const artist = artistRows[0];

    const eventEnd = new Date(
      eventDate.getTime() + input.durationHours * 60 * 60 * 1000,
    );

    // Pricing: admin can override quote/deposit, else recompute from inputs.
    const recomputed = computeQuote({
      level: artist.level as ArtistLevel,
      capacity: input.capacity,
      ticketPriceCents: input.ticketPriceCents,
      setType: input.setType,
      options: [],
    });
    const quotedTotalCents =
      input.quotedTotalCents ?? recomputed.quotedTotalCents;
    const depositAmountCents =
      input.depositAmountCents ?? recomputed.depositAmountCents;

    const initialStatus = (input.initialStatus ??
      BOOKING_STATUS.PENDING_VALIDATION) as BookingStatus;
    // #8 — derive supporting timestamps so a confirmed/completed manual booking
    // is never left with NULL admin_approved_at / paid_at. Stamped at creation
    // time (the admin is recording an already-agreed deal).
    const { derivesAdminApproved, derivesPaid } =
      deriveAdminBookingTimestamps(initialStatus);
    const stampedAt = new Date();
    const adminApprovedAt = derivesAdminApproved ? stampedAt : null;
    const paidAt = derivesPaid ? stampedAt : null;

    const booking = await this.withTransaction(async (client) => {
      if (!input.overrideConflict) {
        await this.assertSlotFree(client, artist.id, eventDate, eventEnd);
      }

      const created = await createBooking.run(
        {
          artistId: artist.id,
          clientAccountId: input.clientAccountId,
          clientLocale: input.locale,
          eventDate,
          eventDurationHours: input.durationHours,
          eventLocationAddress: input.locationAddress,
          eventLocationLat: null,
          eventLocationLng: null,
          eventContext: input.context ?? null,
          capacity: input.capacity,
          ticketPriceCents: input.ticketPriceCents,
          setType: input.setType,
          options: JSON.stringify([]),
          quotedTotalCents,
          depositAmountCents,
          status: initialStatus,
          adminApprovedAt,
          paidAt,
        },
        client,
      );
      if (created.length === 0) {
        throw new InternalError("Booking insert failed");
      }
      return created[0];
    });

    if (!input.skipEmails && input.client.email) {
      await getEmailQueue().enqueue({
        template: EmailTemplate.BOOKING_CONFIRMATION,
        recipient: input.client.email,
        locale: input.locale,
        payload: {
          clientName: input.client.name,
          artistStageName: artist.stage_name,
          eventDate: eventDate.toISOString(),
          quotedTotalCents,
          depositAmountCents,
        },
      });
    }

    await recordAudit({
      actorKind: "admin",
      action: "booking.adminCreate",
      targetKind: "booking",
      targetId: booking.id,
      metadata: {
        artistId: artist.id,
        clientAccountId: input.clientAccountId,
        quotedTotalCents,
        overrideConflict: Boolean(input.overrideConflict),
        // #27 — persist the admin's note so it is not silently discarded.
        ...(input.internalNote ? { internalNote: input.internalNote } : {}),
      },
    });

    return {
      id: booking.id,
      status: booking.status,
      clientEmail: input.client.email ?? "",
    };
  }

  async getById(bookingId: string): Promise<IGetBookingByIdResult> {
    const rows = await getBookingById.run({ bookingId }, this.db);
    if (rows.length === 0) {
      throw new NotFoundError("Booking not found");
    }
    return rows[0];
  }

  /**
   * #9 — admin partial-edit of a booking. When the date/duration change on a
   * non-cancelled booking, re-run the overlap/unavailability checks (skippable
   * with overrideConflict) and guard that the merged deposit never exceeds the
   * merged quoted total.
   */
  async updateForAdmin(
    bookingId: string,
    input: {
      eventDate?: string;
      eventDurationHours?: number;
      eventLocationAddress?: string;
      eventContext?: string | null;
      quotedTotalCents?: number;
      depositAmountCents?: number;
      overrideConflict?: boolean;
    },
  ): Promise<{ id: string; status: BookingStatus; updated_at: Date }> {
    const current = await this.getById(bookingId);

    // Merge requested changes onto the current row so cross-field guards run
    // against the value the booking will actually hold after the update.
    const mergedDuration =
      input.eventDurationHours ?? Number(current.event_duration_hours);
    const mergedEventDate = input.eventDate
      ? new Date(input.eventDate)
      : new Date(current.event_date);
    const mergedTotal = input.quotedTotalCents ?? current.quoted_total_cents;
    const mergedDeposit =
      input.depositAmountCents ?? current.deposit_amount_cents;

    if (mergedDeposit > mergedTotal) {
      throw new ValidationError(
        "Deposit amount cannot exceed the quoted total",
        {
          code: BOOKING_ERROR_CODES.DEPOSIT_EXCEEDS_TOTAL,
        },
      );
    }

    const slotChanged =
      input.eventDate !== undefined || input.eventDurationHours !== undefined;
    const isCancelled = current.status === BOOKING_STATUS.CANCELLED;

    // Re-check availability only when the time slot moves on a live booking and
    // the admin did not explicitly override.
    if (slotChanged && !isCancelled && !input.overrideConflict) {
      const eventEnd = new Date(
        mergedEventDate.getTime() + mergedDuration * 60 * 60 * 1000,
      );
      const overlappingBookings = await listBookingsOverlapping.run(
        {
          artistId: current.artist_id,
          rangeStart: mergedEventDate,
          rangeEnd: eventEnd,
        },
        this.db,
      );
      // The booking being edited will overlap itself — exclude it.
      const otherConflict = overlappingBookings.some((b) => b.id !== bookingId);
      if (otherConflict) {
        throw new ConflictError("Artist is not available at this time");
      }
      const overlappingUnavail = await listUnavailabilitiesInRange.run(
        {
          artistId: current.artist_id,
          rangeStart: mergedEventDate,
          rangeEnd: eventEnd,
        },
        this.db,
      );
      if (overlappingUnavail.length > 0) {
        throw new ConflictError("Artist is not available at this time");
      }
    }

    let rows;
    try {
      rows = await updateBookingAdmin.run(
        {
          bookingId,
          eventDate: input.eventDate ?? null,
          eventDurationHours: input.eventDurationHours ?? null,
          eventLocationAddress: input.eventLocationAddress ?? null,
          eventContext: input.eventContext ?? null,
          quotedTotalCents: input.quotedTotalCents ?? null,
          depositAmountCents: input.depositAmountCents ?? null,
        },
        this.db,
      );
    } catch (error) {
      // The EXCLUDE constraint (#5) is the final authority if a concurrent
      // booking grabbed the new slot between the pre-check and the update.
      if (isOverlapViolation(error)) {
        throw new ConflictError("Artist is not available at this time");
      }
      throw error;
    }
    if (rows.length === 0) {
      throw new NotFoundError("Booking not found");
    }
    return rows[0];
  }

  /**
   * #24 — assert that no unavailability window overlaps a booking's event slot.
   * Called by the admin approve / mark-deposit-paid transitions so a booking is
   * never advanced toward "confirmed" over a slot the artist has since blocked.
   */
  async assertNoUnavailabilityConflict(
    booking: Pick<
      IGetBookingByIdResult,
      "artist_id" | "event_date" | "event_duration_hours"
    >,
  ): Promise<void> {
    const start = new Date(booking.event_date);
    const end = new Date(
      start.getTime() + Number(booking.event_duration_hours) * 60 * 60 * 1000,
    );
    const overlapping = await listUnavailabilitiesInRange.run(
      { artistId: booking.artist_id, rangeStart: start, rangeEnd: end },
      this.db,
    );
    if (overlapping.length > 0) {
      throw new ConflictError(
        "Artist is now unavailable at this booking's time",
      );
    }
  }

  /**
   * Run `fn` inside a single transaction on a dedicated client. Any overlap
   * (exclusion/unique) violation surfaced by the insert is translated into a
   * ConflictError so a concurrent racing insert produces the same friendly
   * error as the in-transaction pre-check (#5).
   */
  private async withTransaction<T>(
    fn: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      if (isOverlapViolation(error)) {
        throw new ConflictError("Artist is not available at this time");
      }
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Pre-check guard run inside the booking transaction: rejects a slot that
   * overlaps an active booking or an unavailability window. The EXCLUDE
   * constraint is still the final authority against concurrent inserts.
   */
  private async assertSlotFree(
    client: PoolClient,
    artistId: string,
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<void> {
    const overlappingBookings = await listBookingsOverlapping.run(
      { artistId, rangeStart, rangeEnd },
      client,
    );
    if (overlappingBookings.length > 0) {
      throw new ConflictError("Artist is not available at this time");
    }

    const overlappingUnavail = await listUnavailabilitiesInRange.run(
      { artistId, rangeStart, rangeEnd },
      client,
    );
    if (overlappingUnavail.length > 0) {
      throw new ConflictError("Artist is not available at this time");
    }
  }
}

export default BookingService;
