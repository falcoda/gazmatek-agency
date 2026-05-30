import { getArtistById } from "@src/db/query/artist/getArtistById.types";
import { getArtistBySlug } from "@src/db/query/artist/getArtistBySlug.types";
import { createBooking } from "@src/db/query/booking/createBooking.types";
import {
  getBookingById,
  IGetBookingByIdResult,
} from "@src/db/query/booking/getBookingById.types";
import { listBookingsOverlapping } from "@src/db/query/booking/listBookingsOverlapping.types";
import { getClientAccountById } from "@src/db/query/clientAccount/getClientAccountById.types";
import { listUnavailabilitiesInRange } from "@src/db/query/unavailability/listUnavailabilitiesInRange.types";
import { recordAudit } from "@src/helpers/audit";
import { ArtistLevel, ArtistSetType } from "@src/helpers/constants/artist";
import {
  BOOKING_STATUS,
  type BookingStatus,
} from "@src/helpers/constants/domain";
import { AUTH_ERROR_CODES } from "@src/helpers/error/constants";
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
  MIN_LEAD_TIME_HOURS,
} from "@src/services/bookings/bookingConstants";
import {
  EmailLocale,
  EmailTemplate,
  getEmailQueue,
} from "@src/services/mailer/queueService";
import { computeArtistFee } from "@src/services/pricing/artistFeeService";
import { VAT_RATE_BPS } from "@src/services/pricing/pricingConstants";
import { Pool } from "pg";

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
 * Server-side quote: recomputes the same breakdown PricingService.estimate()
 * returns so a tampered client payload can't lower the stored total.
 */
function computeQuote(args: {
  level: ArtistLevel;
  capacity: number;
  ticketPriceCents: number;
  setType: ArtistSetType;
  options: BookingOptionInput[];
}): PricingResult {
  const fee = computeArtistFee({
    capacity: args.capacity,
    ticketPrice: args.ticketPriceCents / 100,
    level: args.level,
    setType: args.setType,
  });
  const artistCostCents = Math.round(fee.recommended * 100);
  const optionsCostCents = args.options.reduce(
    (sum, o) => sum + Math.max(0, o.priceCents ?? 0),
    0,
  );
  const subtotalCents = artistCostCents + optionsCostCents;
  const vatCents = Math.round((subtotalCents * VAT_RATE_BPS) / BPS_DIVISOR);
  const quotedTotalCents = subtotalCents + vatCents;
  const depositAmountCents = Math.round(
    (quotedTotalCents * DEPOSIT_PERCENTAGE_BPS) / BPS_DIVISOR,
  );
  return { quotedTotalCents, depositAmountCents };
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
      throw new ValidationError(
        `Event date must be at least ${MIN_LEAD_TIME_HOURS} hours in the future`,
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

    const overlappingBookings = await listBookingsOverlapping.run(
      {
        artistId: artist.id,
        rangeStart: eventDate,
        rangeEnd: eventEnd,
      },
      this.db,
    );
    if (overlappingBookings.length > 0) {
      throw new ConflictError("Artist is not available at this time");
    }

    const overlappingUnavail = await listUnavailabilitiesInRange.run(
      {
        artistId: artist.id,
        rangeStart: eventDate,
        rangeEnd: eventEnd,
      },
      this.db,
    );
    if (overlappingUnavail.length > 0) {
      throw new ConflictError("Artist is not available at this time");
    }

    const { quotedTotalCents, depositAmountCents } = computeQuote({
      level: artist.level as ArtistLevel,
      capacity: input.capacity,
      ticketPriceCents: input.ticketPriceCents,
      setType: input.setType,
      options: input.options,
    });

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
        // `pending_validation`; we surface that here via the constant rather
        // than relying on an implicit `null`. See bookingConstants.ts for the
        // documented status flow.
        status: BOOKING_STATUS.PENDING_VALIDATION,
      },
      this.db,
    );

    if (created.length === 0) {
      throw new InternalError("Booking insert failed");
    }
    const booking = created[0];

    // Non-blocking recap so the client has a written trace of their request.
    // The admin then reaches out manually to handle the deposit/payment off
    // the platform.
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

    if (!input.overrideConflict) {
      const overlappingBookings = await listBookingsOverlapping.run(
        {
          artistId: artist.id,
          rangeStart: eventDate,
          rangeEnd: eventEnd,
        },
        this.db,
      );
      if (overlappingBookings.length > 0) {
        throw new ConflictError("Artist is not available at this time");
      }

      const overlappingUnavail = await listUnavailabilitiesInRange.run(
        {
          artistId: artist.id,
          rangeStart: eventDate,
          rangeEnd: eventEnd,
        },
        this.db,
      );
      if (overlappingUnavail.length > 0) {
        throw new ConflictError("Artist is not available at this time");
      }
    }

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
        // Admin may pick the initial status; otherwise fall back to the same
        // documented default as the public flow.
        status: input.initialStatus ?? BOOKING_STATUS.PENDING_VALIDATION,
      },
      this.db,
    );
    if (created.length === 0) {
      throw new InternalError("Booking insert failed");
    }
    const booking = created[0];

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
}

export default BookingService;
