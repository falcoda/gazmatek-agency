import { getArtistSelfProfile } from "@src/db/query/artist/getArtistSelfProfile.types";
import { setArtistEngagementContract } from "@src/db/query/artist/setArtistEngagementContract.types";
import { updateArtistSelfProfile } from "@src/db/query/artist/updateArtistSelfProfile.types";
import { getArtistPasswordHash } from "@src/db/query/artistAccount/getArtistPasswordHash.types";
import { updateArtistPassword } from "@src/db/query/artistAccount/updateArtistPassword.types";
import { listArtistBookings } from "@src/db/query/booking/listArtistBookings.types";
import { getContractByBookingId } from "@src/db/query/contract/getContractByBookingId.types";
import { getContractById } from "@src/db/query/contract/getContractById.types";
import { getEngagementContractByArtist } from "@src/db/query/contract/getEngagementContractByArtist.types";
import { insertEngagementContract } from "@src/db/query/contract/insertEngagementContract.types";
import { setContractEnvelope } from "@src/db/query/contract/setContractEnvelope.types";
import { setEngagementSigningInfo } from "@src/db/query/contract/setEngagementSigningInfo.types";
import { recordAudit } from "@src/helpers/audit";
import { hashPassword, verifyPassword } from "@src/helpers/auth/password";
import { config } from "@src/helpers/config";
import { AUDIT_ACTION, AUDIT_ACTOR_KIND } from "@src/helpers/constants/domain";
import { ERROR_MESSAGES } from "@src/helpers/error/constants";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@src/helpers/error/errors";
import { countPdfPages } from "@src/helpers/pdf/countPdfPages";
import type {
  ChangeArtistPasswordBody,
  ListArtistBookingsQuery,
  UpdateArtistProfileBody,
} from "@src/schemas/artistArea";
import { engagementSignableProfileSchema } from "@src/schemas/artistArea";
import { getAgencyInfo } from "@src/services/agency/agencyInfoService";
import { getAgencySignatureDataUrl } from "@src/services/agency/agencySignatureService";
import { BOOKING_STATUS } from "@src/services/bookings/bookingConstants";
import BookingService from "@src/services/bookings/bookingService";
import { renderContractPdf } from "@src/services/contract/contractPdfRenderer";
import { renderEngagementContractHtml } from "@src/services/contract/engagementContractTemplate";
import {
  addSignatureField,
  createEnvelopeFromPdf,
  distributeEnvelope,
  DOCUMENSO_RECIPIENT_ROLE,
  extractSigningUrl,
  getEnvelopeDetail,
} from "@src/services/documenso/documensoClient";
import { getStorageService } from "@src/services/storage";
import { Pool } from "pg";

const ENGAGEMENT_TEMPLATE_VERSION = "v1";
const ENGAGEMENT_PDF_KEY_PREFIX = "engagement";
const DOCUMENSO_PROVIDER_NAME = "documenso";

// S-49 — fields an artist may edit on its own profile. Admin-only fields
// (level, pricing, publication) are deliberately excluded from this surface.
const COVER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const COVER_IMAGE_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export interface ArtistBookingListItem {
  id: string;
  clientName: string | null;
  eventDate: Date;
  // pgtyped exposes NUMERIC columns as strings; surfaced as-is to the client.
  eventDurationHours: string;
  eventLocation: string;
  quotedTotalCents: number;
  depositAmountCents: number | null;
  status: string;
  paidAt: Date | null;
}

export interface ArtistBookingListResult {
  data: ArtistBookingListItem[];
  pagination: { page: number; pageSize: number };
}

export interface ArtistBookingDetailResult {
  id: string;
  status: string;
  eventDate: Date;
  // pgtyped exposes NUMERIC columns as strings; surfaced as-is to the client.
  eventDurationHours: string;
  eventLocation: string;
  eventContext: string | null;
  options: unknown;
  quotedTotalCents: number;
  depositAmountCents: number | null;
  client: {
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  cancelReason: string | null;
}

export interface ArtistContractSummary {
  id: string;
  status: string;
  pdfUrl: string;
  signedAt: Date | null;
}

export interface EngagementContractSummary {
  id: string;
  status: string;
  pdfUrl: string | null;
  signedPdfUrl: string | null;
  signedAt: Date | null;
}

export interface SignEngagementResult {
  id: string;
  status: string;
  signingUrl: string | null;
  signedAt: Date | null;
}

export interface SignBookingContractResult {
  signingUrl: string | null;
  envelopeId?: string;
  status?: string;
}

export const ARTIST_COVER_IMAGE_LIMITS = {
  MAX_BYTES: COVER_IMAGE_MAX_BYTES,
  ALLOWED_MIME: COVER_IMAGE_ALLOWED_MIME,
} as const;

export class ArtistAreaService {
  constructor(
    private db: Pool,
    private bookingService: BookingService,
  ) {}

  async getProfile(artistId: string) {
    const rows = await getArtistSelfProfile.run({ artistId }, this.db);
    if (rows.length === 0) throw new NotFoundError("Artist not found");
    return rows[0];
  }

  async updateProfile(artistId: string, body: UpdateArtistProfileBody) {
    const social =
      body.social_links !== undefined && body.social_links !== null
        ? JSON.stringify(body.social_links)
        : null;

    const updated = await updateArtistSelfProfile.run(
      {
        artistId,
        bioFr: body.bio_fr ?? null,
        bioNl: body.bio_nl ?? null,
        bioEn: body.bio_en ?? null,
        technicalInfoFr: body.technical_info_fr ?? null,
        technicalInfoNl: body.technical_info_nl ?? null,
        technicalInfoEn: body.technical_info_en ?? null,
        socialLinks: social,
        coverImageUrl: body.cover_image_url ?? null,
        fullName: body.full_name ?? null,
        phone: body.phone ?? null,
        address: body.address ?? null,
        country: body.country ?? null,
        vatNumber: body.vat_number ?? null,
        companyNumber: body.company_number ?? null,
      },
      this.db,
    );
    if (updated.length === 0) throw new NotFoundError("Artist not found");

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.ARTIST,
      actorId: artistId,
      action: AUDIT_ACTION.ARTIST_PROFILE_UPDATE,
      targetKind: "artist",
      targetId: artistId,
      metadata: { fields: Object.keys(body) },
    });

    return updated[0];
  }

  async uploadCoverImage(
    artistId: string,
    file: { buffer: Buffer; mimetype: string; size: number },
  ) {
    if (!COVER_IMAGE_ALLOWED_MIME.has(file.mimetype)) {
      throw new ValidationError("Unsupported image format");
    }
    const ext =
      file.mimetype === "image/png"
        ? "png"
        : file.mimetype === "image/webp"
          ? "webp"
          : "jpg";
    const relativePath = `artists/cover/${artistId}-${Date.now()}.${ext}`;
    await getStorageService().saveBuffer(relativePath, file.buffer);

    const url = `${config.app.baseUrl}/api/storage/${relativePath}`;
    const updated = await updateArtistSelfProfile.run(
      {
        artistId,
        bioFr: null,
        bioNl: null,
        bioEn: null,
        technicalInfoFr: null,
        technicalInfoNl: null,
        technicalInfoEn: null,
        socialLinks: null,
        coverImageUrl: url,
        fullName: null,
        phone: null,
        address: null,
        country: null,
        vatNumber: null,
        companyNumber: null,
      },
      this.db,
    );
    if (updated.length === 0) throw new NotFoundError("Artist not found");

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.ARTIST,
      actorId: artistId,
      action: AUDIT_ACTION.ARTIST_COVER_UPLOAD,
      targetKind: "artist",
      targetId: artistId,
      metadata: { relativePath, mimetype: file.mimetype, bytes: file.size },
    });

    return { url, profile: updated[0] };
  }

  async changePassword(
    artistId: string,
    body: ChangeArtistPasswordBody,
  ): Promise<void> {
    const accountRows = await getArtistPasswordHash.run({ artistId }, this.db);
    if (accountRows.length === 0) throw new NotFoundError("Account not found");

    const ok = await verifyPassword(
      accountRows[0].password_hash,
      body.currentPassword,
    );
    if (!ok) throw new ForbiddenError("Current password is incorrect");

    const newHash = await hashPassword(body.newPassword);
    await updateArtistPassword.run(
      { artistId, newPasswordHash: newHash },
      this.db,
    );

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.ARTIST,
      actorId: artistId,
      action: AUDIT_ACTION.ARTIST_PASSWORD_CHANGE,
      targetKind: "artist_account",
      targetId: artistId,
    });
  }

  async listBookings(
    artistId: string,
    query: ListArtistBookingsQuery,
  ): Promise<ArtistBookingListResult> {
    const { tab, page } = query;
    const pageSize = query.page_size;

    const rows = await listArtistBookings.run(
      {
        artistId,
        upcoming: tab === "upcoming",
        pageLimit: pageSize,
        pageOffset: (page - 1) * pageSize,
      },
      this.db,
    );

    return {
      data: rows.map((r) => ({
        id: r.id,
        clientName: r.client_name,
        eventDate: r.event_date,
        eventDurationHours: r.event_duration_hours,
        eventLocation: r.event_location_address,
        quotedTotalCents: r.quoted_total_cents,
        depositAmountCents: r.deposit_amount_cents,
        status: r.status,
        paidAt: r.paid_at,
      })),
      pagination: { page, pageSize },
    };
  }

  async getBookingDetail(
    artistId: string,
    bookingId: string,
  ): Promise<ArtistBookingDetailResult> {
    const booking = await this.requireOwnedBooking(artistId, bookingId);
    const confirmed =
      booking.status === BOOKING_STATUS.CONFIRMED ||
      booking.status === BOOKING_STATUS.COMPLETED;

    return {
      id: booking.id,
      status: booking.status,
      eventDate: booking.event_date,
      eventDurationHours: booking.event_duration_hours,
      eventLocation: booking.event_location_address,
      eventContext: booking.event_context,
      options: booking.options,
      quotedTotalCents: booking.quoted_total_cents,
      depositAmountCents: booking.deposit_amount_cents,
      // RGPD: client identity is masked until payment is confirmed.
      client: confirmed
        ? {
            name: booking.client_name,
            email: booking.client_email,
            phone: booking.client_phone,
          }
        : null,
      cancelReason: booking.cancel_reason,
    };
  }

  async getBookingContract(
    artistId: string,
    bookingId: string,
  ): Promise<ArtistContractSummary> {
    const booking = await this.requireOwnedBooking(artistId, bookingId);
    const contractRows = await getContractByBookingId.run(
      { bookingId: booking.id },
      this.db,
    );
    if (contractRows.length === 0) {
      throw new NotFoundError("Contract not available yet");
    }
    const contract = contractRows[0];

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.ARTIST,
      actorId: artistId,
      action: AUDIT_ACTION.CONTRACT_VIEW,
      targetKind: "contract",
      targetId: contract.id,
    });

    return {
      id: contract.id,
      status: contract.status,
      pdfUrl: `${config.app.baseUrl}/api/artist/contracts/${contract.id}/download`,
      signedAt: contract.signed_at,
    };
  }

  async signBookingContract(
    artistId: string,
    contractId: string,
  ): Promise<SignBookingContractResult> {
    const contractRows = await getContractById.run({ contractId }, this.db);
    if (contractRows.length === 0) {
      throw new NotFoundError("Contract not found");
    }
    const contract = contractRows[0];
    if (contract.artist_id !== artistId) {
      throw new NotFoundError("Contract not found");
    }
    if (contract.status === "signed") {
      return { signingUrl: null, status: contract.status };
    }

    // Stub signature provider: generate a deterministic envelope id and a
    // pseudo signing URL pointing back at our webhook for an end-to-end test.
    const envelopeId = `env_${contract.id}_${Date.now()}`;
    await setContractEnvelope.run(
      {
        contractId: contract.id,
        provider: config.signature.provider,
        envelopeId,
      },
      this.db,
    );

    return {
      signingUrl: `${config.app.baseUrl}/artist/contracts/${contract.id}/stub-sign?envelope=${envelopeId}`,
      envelopeId,
    };
  }

  async getOrCreateEngagementContract(
    artistId: string,
  ): Promise<EngagementContractSummary> {
    let rows = await getEngagementContractByArtist.run({ artistId }, this.db);
    if (rows.length === 0) {
      const pdfStorageKey = `${ENGAGEMENT_PDF_KEY_PREFIX}/${artistId}/contract.pdf`;
      const inserted = await insertEngagementContract.run(
        {
          artistId,
          pdfStorageKey,
          templateVersion: ENGAGEMENT_TEMPLATE_VERSION,
        },
        this.db,
      );
      if (inserted.length === 0) {
        throw new ValidationError("Failed to initialize engagement contract");
      }
      await setArtistEngagementContract.run(
        { artistId, contractId: inserted[0].id },
        this.db,
      );
      rows = await getEngagementContractByArtist.run({ artistId }, this.db);
    }

    const contract = rows[0];

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.ARTIST,
      actorId: artistId,
      action: AUDIT_ACTION.ENGAGEMENT_CONTRACT_VIEW,
      targetKind: "contract",
      targetId: contract.id,
    });

    return {
      id: contract.id,
      status: contract.status,
      pdfUrl: null,
      signedPdfUrl: null,
      signedAt: contract.signed_at,
    };
  }

  // S-51 / S-20 — produce (or re-fetch) a Documenso signing URL for the
  // artist's engagement contract.
  async signEngagementContract(
    artistId: string,
    artistEmail: string,
  ): Promise<SignEngagementResult> {
    this.ensureDocumensoConfigured();

    const rows = await getEngagementContractByArtist.run({ artistId }, this.db);
    if (rows.length === 0) {
      throw new NotFoundError("Engagement contract not found");
    }
    const contract = rows[0];

    if (contract.status === "signed") {
      return {
        id: contract.id,
        status: contract.status,
        signingUrl: null,
        signedAt: contract.signed_at,
      };
    }

    // An envelope already exists: re-extract the signing URL (recipient tokens
    // are stable, so we don't recreate the envelope on each click).
    if (contract.signature_provider_envelope_id) {
      const existing = await getEnvelopeDetail(
        config.documenso.url,
        config.documenso.apiKey,
        contract.signature_provider_envelope_id,
      );
      const signingUrl = extractSigningUrl(existing, config.documenso.url);
      return {
        id: contract.id,
        status: contract.status,
        signingUrl,
        signedAt: null,
      };
    }

    // First click: render PDF, upload to Documenso, attach a signature field,
    // distribute (without email — the user is redirected to the signing URL),
    // then persist the envelope id.
    const profileRows = await getArtistSelfProfile.run({ artistId }, this.db);
    if (profileRows.length === 0) throw new NotFoundError("Artist not found");
    const profile = profileRows[0];
    // Gate the signature on a complete profile: we never want to send a
    // binding contract to Documenso with blank legal fields.
    this.assertEngagementInfoComplete(profile);
    const signerName =
      profile.full_name ?? profile.stage_name ?? "Artiste Gazmatek";
    const title = `Contrat d'engagement — ${profile.stage_name}`;

    const [agencySignatureDataUrl, agency] = await Promise.all([
      getAgencySignatureDataUrl(),
      getAgencyInfo(),
    ]);
    const html = renderEngagementContractHtml({
      stageName: profile.stage_name,
      fullName: profile.full_name,
      email: artistEmail,
      phone: profile.phone,
      address: profile.address,
      country: profile.country,
      vatNumber: profile.vat_number,
      companyNumber: profile.company_number,
      agencySignatureDataUrl,
      agency,
      agencyName: config.app.name,
      signedOnDate: new Date().toLocaleDateString("fr-BE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    });
    const pdfBuffer = await renderContractPdf({ htmlContent: html, title });

    const envelope = await createEnvelopeFromPdf(
      config.documenso.url,
      config.documenso.apiKey,
      pdfBuffer,
      title,
      { email: artistEmail, name: signerName },
    );

    const detail = await getEnvelopeDetail(
      config.documenso.url,
      config.documenso.apiKey,
      envelope.id,
    );
    const signer = detail.recipients.find(
      (r) => r.role === DOCUMENSO_RECIPIENT_ROLE.SIGNER,
    );
    const envelopeItem = detail.envelopeItems[0];
    if (signer && envelopeItem) {
      // Anchor the Documenso signature field on the LAST page so it lines up
      // with the visible signature block (the HTML template forces a page
      // break before that block).
      const lastPage = countPdfPages(pdfBuffer);
      await addSignatureField(
        config.documenso.url,
        config.documenso.apiKey,
        envelope.id,
        signer.id,
        envelopeItem.id,
        lastPage,
      );
    }

    const distributed = await distributeEnvelope(
      config.documenso.url,
      config.documenso.apiKey,
      envelope.id,
      false,
    );
    const signingUrl = extractSigningUrl(distributed, config.documenso.url);

    const pdfStorageKey = `${ENGAGEMENT_PDF_KEY_PREFIX}/${artistId}/${envelope.id}.pdf`;
    await setEngagementSigningInfo.run(
      {
        contractId: contract.id,
        provider: DOCUMENSO_PROVIDER_NAME,
        envelopeId: envelope.id,
        pdfStorageKey,
      },
      this.db,
    );

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.ARTIST,
      actorId: artistId,
      action: AUDIT_ACTION.ENGAGEMENT_CONTRACT_ENVELOPE_CREATED,
      targetKind: "contract",
      targetId: contract.id,
      metadata: { envelopeId: envelope.id },
    });

    return {
      id: contract.id,
      status: "pending_signature",
      signingUrl,
      signedAt: null,
    };
  }

  // Enforces the "all artist info present" rule before an engagement contract
  // can be signed, via the shared Zod schema. Failing fields are surfaced as
  // `missingFields` for the client. VAT and company numbers stay optional by
  // design (see engagementSignableProfileSchema).
  private assertEngagementInfoComplete(profile: {
    full_name: string | null;
    phone: string | null;
    address: string | null;
    country: string | null;
  }): void {
    const result = engagementSignableProfileSchema.safeParse(profile);
    if (!result.success) {
      throw new ValidationError(ERROR_MESSAGES.ENGAGEMENT_INFO_INCOMPLETE, {
        missingFields: result.error.issues.map((issue) => issue.path.join(".")),
      });
    }
  }

  private async requireOwnedBooking(artistId: string, bookingId: string) {
    const booking = await this.bookingService.getById(bookingId);
    if (booking.artist_id !== artistId) {
      throw new NotFoundError("Booking not found");
    }
    return booking;
  }

  private ensureDocumensoConfigured(): void {
    const missing: string[] = [];
    if (!config.documenso.url) missing.push("DOCUMENSO_URL");
    if (!config.documenso.apiKey) missing.push("DOCUMENSO_API_KEY");
    if (missing.length > 0) {
      throw new ValidationError(
        `Documenso is not configured: missing ${missing.join(", ")}`,
      );
    }
  }
}

export default ArtistAreaService;
