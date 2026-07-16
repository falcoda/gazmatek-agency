import { getBookingById } from "@src/db/query/booking/getBookingById.types";
import { cancelBookingByClient } from "@src/db/query/clientAccount/cancelBookingByClient.types";
import { consumeClientPasswordResetToken } from "@src/db/query/clientAccount/consumeClientPasswordResetToken.types";
import { createClientAccount } from "@src/db/query/clientAccount/createClientAccount.types";
import { createStubClientAccount } from "@src/db/query/clientAccount/createStubClientAccount.types";
import { editBookingByClient } from "@src/db/query/clientAccount/editBookingByClient.types";
import { getClientAccountByEmail } from "@src/db/query/clientAccount/getClientAccountByEmail.types";
import { getClientAccountById } from "@src/db/query/clientAccount/getClientAccountById.types";
import { incrementClientFailedAttempts } from "@src/db/query/clientAccount/incrementClientFailedAttempts.types";
import { listBookingsByClient } from "@src/db/query/clientAccount/listBookingsByClient.types";
import { resetClientFailedAttempts } from "@src/db/query/clientAccount/resetClientFailedAttempts.types";
import { setClientInvitationTokenById } from "@src/db/query/clientAccount/setClientInvitationTokenById.types";
import { setClientPasswordResetToken } from "@src/db/query/clientAccount/setClientPasswordResetToken.types";
import { recordAudit } from "@src/helpers/audit";
import { signIdentityToken, UserKind } from "@src/helpers/auth/identity";
import { hashPassword, verifyPassword } from "@src/helpers/auth/password";
import { generateRawToken, hashToken } from "@src/helpers/auth/tokens";
import { config } from "@src/helpers/config";
import {
  AUDIT_ACTION,
  AUDIT_ACTOR_KIND,
  AUDIT_TARGET_KIND,
  IDENTITY_KIND,
} from "@src/helpers/constants/domain";
import { ERROR_MESSAGES } from "@src/helpers/error/constants";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@src/helpers/error/errors";
import {
  consumeRefreshToken,
  issueRefreshToken,
  revokeAllForSubject,
  revokeRefreshToken,
} from "@src/services/auth/identityRefreshService";
import {
  BOOKING_STATUS,
  type BookingStatus,
  MIN_LEAD_TIME_HOURS,
} from "@src/services/bookings/bookingConstants";
import {
  DEFAULT_EMAIL_LOCALE,
  EmailLocale,
  EmailTemplate,
  getEmailQueue,
} from "@src/services/mailer/queueService";
import { Pool } from "pg";

// Short-lived link used for the forgot-password flow.
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
// Admin-issued "claim your account" links live much longer (one week) so the
// client has time to react to the invitation email.
const CLIENT_INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface ClientIdentity {
  id: string;
  email: string | null;
  displayName: string | null;
}

export interface ClientAuthResult {
  token: string;
  refreshToken: string;
  expiresInSeconds: number;
  refreshExpiresInSeconds: number;
  client: ClientIdentity;
}

export interface ClientBookingSummary {
  id: string;
  status: string;
  eventDate: string;
  eventDurationHours: number;
  eventLocationAddress: string;
  eventContext: string | null;
  quotedTotalCents: number;
  createdAt: string;
  artist: {
    id: string;
    slug: string;
    stageName: string;
    coverImageUrl: string | null;
  };
}

export class ClientAuthService {
  constructor(private db: Pool) {}

  private buildAuthResult(
    account: { id: string; email: string | null; display_name: string | null },
    signed: { token: string; expiresInSeconds: number },
    refresh: { rawToken: string; expiresInSeconds: number },
  ): ClientAuthResult {
    return {
      token: signed.token,
      refreshToken: refresh.rawToken,
      expiresInSeconds: signed.expiresInSeconds,
      refreshExpiresInSeconds: refresh.expiresInSeconds,
      client: {
        id: account.id,
        email: account.email,
        displayName: account.display_name,
      },
    };
  }

  private async issueTokens(account: {
    id: string;
    email: string | null;
    display_name: string | null;
  }): Promise<ClientAuthResult> {
    // Tokens are only ever issued for accounts that have an email (login,
    // register, claim-then-login). Stubs cannot reach this path because they
    // are gated in login/refresh. The empty-string fallback keeps the JWT
    // shape stable if we ever extend the issuance path.
    const signed = signIdentityToken({
      data: account.email ?? "",
      kind: UserKind.CLIENT,
      sub: account.id,
    });
    const refresh = await issueRefreshToken(
      this.db,
      IDENTITY_KIND.CLIENT,
      account.id,
    );
    return this.buildAuthResult(account, signed, refresh);
  }

  async register(input: {
    email: string;
    password: string;
    displayName: string;
    phone?: string;
    companyName?: string;
    companyNumber?: string;
    vatNumber?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressZip?: string;
    addressCity?: string;
    addressCountry?: string;
  }): Promise<ClientAuthResult> {
    const normalizedEmail = input.email.toLowerCase();
    const existing = await getClientAccountByEmail.run(
      { email: normalizedEmail },
      this.db,
    );

    const passwordHash = await hashPassword(input.password);

    // An email that already maps to an account — claimed or an admin-created
    // stub — cannot be registered through the public signup. Claimed accounts
    // already exist; unclaimed stubs must be activated through the invitation
    // link (which proves email ownership), never by anyone who guesses the email
    // here. We return the same generic conflict in both cases so signup does not
    // leak which emails are already known to the agency.
    if (existing.length > 0) {
      throw new ConflictError(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    const created = await createClientAccount.run(
      {
        email: normalizedEmail,
        passwordHash,
        displayName: input.displayName.trim(),
        phone: input.phone?.trim() || null,
        companyName: input.companyName?.trim() || null,
        companyNumber: input.companyNumber?.trim() || null,
        vatNumber: input.vatNumber?.trim() || null,
        addressStreet: input.addressStreet?.trim() || null,
        addressNumber: input.addressNumber?.trim() || null,
        addressZip: input.addressZip?.trim() || null,
        addressCity: input.addressCity?.trim() || null,
        addressCountry: input.addressCountry?.trim() || null,
      },
      this.db,
    );
    if (created.length === 0) {
      throw new UnauthorizedError("Failed to create account");
    }
    const account = created[0];

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.CLIENT,
      actorId: account.id,
      action: AUDIT_ACTION.CLIENT_REGISTER,
      targetKind: AUDIT_TARGET_KIND.CLIENT_ACCOUNT,
      targetId: account.id,
    });

    return this.issueTokens(account);
  }

  /**
   * Lookup-or-create a client account on behalf of an admin booking. If the
   * email matches an existing account (claimed or stub), reuse it. Otherwise
   * a stub is created. With no email at all, a fresh stub is always created
   * (admin will have to add an email later to send an invitation).
   */
  async findOrCreateStubClient(input: {
    displayName: string;
    email?: string;
    phone?: string;
  }): Promise<{
    id: string;
    email: string | null;
    display_name: string | null;
  }> {
    const normalizedEmail = input.email?.trim().toLowerCase() || null;

    if (normalizedEmail) {
      const existing = await getClientAccountByEmail.run(
        { email: normalizedEmail },
        this.db,
      );
      if (existing.length > 0) {
        return {
          id: existing[0].id,
          email: existing[0].email,
          display_name: existing[0].display_name,
        };
      }
    }

    const created = await createStubClientAccount.run(
      {
        email: normalizedEmail,
        displayName: input.displayName.trim(),
        phone: input.phone?.trim() || null,
        companyName: null,
        companyNumber: null,
        vatNumber: null,
        addressStreet: null,
        addressNumber: null,
        addressZip: null,
        addressCity: null,
        addressCountry: null,
      },
      this.db,
    );
    if (created.length === 0) {
      throw new UnauthorizedError("Failed to create stub client account");
    }
    return created[0];
  }

  /**
   * Sends an invitation email containing a single-use token the stub client
   * can use to set their password and activate the account.
   */
  async inviteClient(clientId: string, locale: EmailLocale): Promise<void> {
    const rows = await getClientAccountById.run({ clientId }, this.db);
    if (rows.length === 0) {
      throw new NotFoundError("Client account not found");
    }
    const account = rows[0];
    if (!account.email) {
      throw new ValidationError(
        "Cannot invite a client without an email address",
      );
    }
    if (account.claimed_at) {
      throw new ConflictError("Client account already claimed");
    }

    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + CLIENT_INVITATION_TTL_MS);

    await setClientInvitationTokenById.run(
      { clientId, tokenHash, expiresAt },
      this.db,
    );

    const baseUrl = config.app.baseUrl ?? "";
    const claimUrl = `${baseUrl}/${locale}/account/claim?token=${rawToken}`;

    await getEmailQueue().enqueue({
      template: EmailTemplate.CLIENT_INVITATION,
      recipient: account.email,
      locale,
      payload: {
        claimUrl,
        expiresAt: expiresAt.toISOString(),
        displayName: account.display_name ?? "",
      },
    });

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.ADMIN,
      action: AUDIT_ACTION.CLIENT_INVITE,
      targetKind: AUDIT_TARGET_KIND.CLIENT_ACCOUNT,
      targetId: clientId,
    });
  }

  async login(email: string, password: string): Promise<ClientAuthResult> {
    const rows = await getClientAccountByEmail.run(
      { email: email.toLowerCase() },
      this.db,
    );
    if (rows.length === 0) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    const account = rows[0];

    if (!account.is_active) {
      throw new ForbiddenError("Account disabled");
    }
    // Stub accounts (admin-created, not yet claimed) cannot log in until the
    // client consumes the invitation token and sets a password.
    if (!account.claimed_at || !account.password_hash) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    if (account.locked_until && account.locked_until.getTime() > Date.now()) {
      throw new ForbiddenError("Account temporarily locked");
    }

    const ok = await verifyPassword(account.password_hash, password);
    if (!ok) {
      await incrementClientFailedAttempts.run(
        { clientId: account.id },
        this.db,
      );
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    await resetClientFailedAttempts.run({ clientId: account.id }, this.db);

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.CLIENT,
      actorId: account.id,
      action: AUDIT_ACTION.CLIENT_LOGIN,
      targetKind: AUDIT_TARGET_KIND.CLIENT_ACCOUNT,
      targetId: account.id,
    });

    return this.issueTokens(account);
  }

  async refresh(rawToken: string): Promise<ClientAuthResult> {
    const validated = await consumeRefreshToken(this.db, rawToken);
    if (!validated || validated.kind !== IDENTITY_KIND.CLIENT) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }
    const rows = await getClientAccountById.run(
      { clientId: validated.subjectId },
      this.db,
    );
    if (rows.length === 0) {
      throw new UnauthorizedError("Account not found");
    }
    const account = rows[0];
    if (!account.is_active) {
      throw new ForbiddenError("Account disabled");
    }

    return this.issueTokens(account);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    await revokeRefreshToken(this.db, rawRefreshToken);
  }

  async forgotPassword(email: string, locale: EmailLocale): Promise<void> {
    // Only fully activated accounts may receive a reset link. Issuing a reset
    // for an unclaimed admin-created stub would let anyone who knows the email
    // claim the account through the reset flow (the consume query backfills
    // claimed_at). Stub activation must go exclusively through the invitation
    // link, so we silently no-op here for stubs, unknown, and disabled emails.
    const normalizedEmail = email.toLowerCase();
    const accounts = await getClientAccountByEmail.run(
      { email: normalizedEmail },
      this.db,
    );
    const account = accounts[0];
    if (!account || !account.claimed_at || !account.is_active) {
      // Silent — do NOT reveal whether the email exists or its state.
      return;
    }

    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

    const rows = await setClientPasswordResetToken.run(
      {
        email: normalizedEmail,
        tokenHash,
        expiresAt,
      },
      this.db,
    );
    if (rows.length === 0) {
      // Silent — do NOT reveal whether the email exists.
      return;
    }

    const baseUrl = config.app.baseUrl ?? "";
    const resetUrl = `${baseUrl}/${locale}/account/reset-password?token=${rawToken}`;

    await getEmailQueue().enqueue({
      template: EmailTemplate.PASSWORD_RESET,
      recipient: email,
      locale,
      payload: { resetUrl, expiresAt: expiresAt.toISOString() },
    });
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ email: string | null }> {
    const tokenHash = hashToken(token);
    const newHash = await hashPassword(newPassword);
    const rows = await consumeClientPasswordResetToken.run(
      { tokenHash, newPasswordHash: newHash },
      this.db,
    );
    if (rows.length === 0) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_RESET_TOKEN);
    }
    // Invalidate every outstanding session: a password reset must defeat a
    // stolen refresh token, otherwise the attacker keeps access for the full
    // 30-day refresh TTL despite the victim resetting their password.
    await revokeAllForSubject(this.db, IDENTITY_KIND.CLIENT, rows[0].id);
    return { email: rows[0].email };
  }

  private static readonly CANCELLABLE_STATUSES: BookingStatus[] = [
    BOOKING_STATUS.PENDING_VALIDATION,
    BOOKING_STATUS.AWAITING_DEPOSIT,
    BOOKING_STATUS.CONFIRMED,
  ];

  private static readonly DEFAULT_CLIENT_CANCEL_REASON = "Cancelled by client";

  /**
   * Cancel a booking owned by `clientId`. The SQL atomically enforces
   * ownership, allowed-status, and the lead-time window. When 0 rows are
   * updated we re-read the booking to translate the silent NOOP into a
   * specific 404/409 (never leak that a booking belongs to someone else —
   * surface NotFound in both "missing" and "not yours" cases).
   */
  async cancelBooking(
    clientId: string,
    bookingId: string,
    reason?: string,
  ): Promise<{ id: string; status: BookingStatus; cancelReason: string }> {
    const finalReason =
      reason?.trim() || ClientAuthService.DEFAULT_CLIENT_CANCEL_REASON;

    const updated = await cancelBookingByClient.run(
      {
        bookingId,
        clientId,
        reason: finalReason,
        minLeadHours: MIN_LEAD_TIME_HOURS,
      },
      this.db,
    );

    if (updated.length === 0) {
      const existing = await getBookingById.run({ bookingId }, this.db);
      if (existing.length === 0 || existing[0].client_account_id !== clientId) {
        throw new NotFoundError("Booking not found");
      }
      const booking = existing[0];
      if (!ClientAuthService.CANCELLABLE_STATUSES.includes(booking.status)) {
        throw new ConflictError(
          `Booking cannot be cancelled in status ${booking.status}`,
        );
      }
      const leadMs = MIN_LEAD_TIME_HOURS * 60 * 60 * 1000;
      if (booking.event_date.getTime() - Date.now() <= leadMs) {
        throw new ConflictError(
          `Bookings cannot be cancelled within ${MIN_LEAD_TIME_HOURS}h of the event`,
        );
      }
      // Should never reach here: SQL refused but no business rule matched.
      throw new ConflictError("Booking cannot be cancelled");
    }

    // Confirm the cancellation back to the client: the SQL enforces the rules
    // silently, so without this the only feedback is the dashboard refreshing.
    const cancelled = await getBookingById.run({ bookingId }, this.db);
    const booking = cancelled[0];
    if (booking?.client_email) {
      await getEmailQueue().enqueue({
        template: EmailTemplate.BOOKING_CANCELLED,
        recipient: booking.client_email,
        locale: (booking.client_locale ?? DEFAULT_EMAIL_LOCALE) as EmailLocale,
        payload: {
          clientName: booking.client_name ?? "",
          artistStageName: booking.artist_stage_name,
          eventDate: booking.event_date,
          reason: finalReason,
        },
      });
    }

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.CLIENT,
      actorId: clientId,
      action: AUDIT_ACTION.BOOKING_CANCEL,
      targetKind: AUDIT_TARGET_KIND.BOOKING,
      targetId: bookingId,
      metadata: { reason: finalReason },
    });

    return {
      id: updated[0].id,
      status: updated[0].status,
      cancelReason: updated[0].cancel_reason ?? finalReason,
    };
  }

  /**
   * #30 — edit a booking owned by `clientId`, restricted to `pending_validation`.
   * Ownership and status are enforced in SQL (mirrors cancelBookingByClient): a
   * 0-row update is translated into a specific 404/409. A date/duration change
   * may collide with the active-booking EXCLUDE constraint (#5), surfaced as a
   * ConflictError. The response reuses the existing client booking summary shape.
   */
  async editBooking(
    clientId: string,
    bookingId: string,
    input: {
      eventDate?: string;
      durationHours?: number;
      location?: { address: string; lat?: number; lng?: number };
      context?: string | null;
      capacity?: number;
      ticketPriceCents?: number;
    },
  ): Promise<ClientBookingSummary> {
    let updated;
    try {
      updated = await editBookingByClient.run(
        {
          bookingId,
          clientId,
          eventDate: input.eventDate ? new Date(input.eventDate) : null,
          eventDurationHours: input.durationHours ?? null,
          eventLocationAddress: input.location?.address ?? null,
          eventLocationLat: input.location?.lat ?? null,
          eventLocationLng: input.location?.lng ?? null,
          eventContext: input.context ?? null,
          capacity: input.capacity ?? null,
          ticketPriceCents: input.ticketPriceCents ?? null,
        },
        this.db,
      );
    } catch (error) {
      // The EXCLUDE constraint (#5) rejects a slot that now overlaps another
      // active booking; translate it into a friendly conflict.
      const code = (error as { code?: string } | null)?.code;
      if (code === "23P01" || code === "23505") {
        throw new ConflictError("Artist is not available at this time");
      }
      throw error;
    }

    if (updated.length === 0) {
      const existing = await getBookingById.run({ bookingId }, this.db);
      if (existing.length === 0 || existing[0].client_account_id !== clientId) {
        throw new NotFoundError("Booking not found");
      }
      if (existing[0].status !== BOOKING_STATUS.PENDING_VALIDATION) {
        throw new ConflictError(
          `Booking can only be edited while pending validation (status ${existing[0].status})`,
        );
      }
      throw new ConflictError("Booking cannot be edited");
    }

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.CLIENT,
      actorId: clientId,
      action: AUDIT_ACTION.BOOKING_UPDATE,
      targetKind: AUDIT_TARGET_KIND.BOOKING,
      targetId: bookingId,
      metadata: { fields: Object.keys(input) },
    });

    // Reuse the canonical client summary shape (includes artist cover) by
    // re-reading from the client's own booking list.
    const summaries = await this.listBookings(clientId);
    const summary = summaries.find((b) => b.id === bookingId);
    if (!summary) {
      // Defensive: the booking was just updated, it must be in the list.
      throw new NotFoundError("Booking not found");
    }
    return summary;
  }

  async listBookings(clientId: string): Promise<ClientBookingSummary[]> {
    const rows = await listBookingsByClient.run({ clientId }, this.db);
    return rows.map((r) => ({
      id: r.id,
      status: r.status,
      eventDate: r.event_date.toISOString(),
      eventDurationHours: Number(r.event_duration_hours),
      eventLocationAddress: r.event_location_address,
      eventContext: r.event_context,
      quotedTotalCents: r.quoted_total_cents,
      createdAt: r.created_at.toISOString(),
      artist: {
        id: r.artist_id,
        slug: r.artist_slug,
        stageName: r.artist_stage_name,
        coverImageUrl: r.artist_cover_image_url,
      },
    }));
  }
}

export default ClientAuthService;
