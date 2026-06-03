import pool from "@src/db/dbConnect";
import { getArtistSelfProfile } from "@src/db/query/artist/getArtistSelfProfile.types";
import { resetArtistOnboarding } from "@src/db/query/artist/resetArtistOnboarding.types";
import { getArtistAccountById } from "@src/db/query/artistAccount/getArtistAccountById.types";
import { countArtistActiveBookings } from "@src/db/query/artistAdmin/countArtistActiveBookings.types";
import { countArtistsAdmin } from "@src/db/query/artistAdmin/countArtistsAdmin.types";
import { deleteArtist } from "@src/db/query/artistAdmin/deleteArtist.types";
import { getArtistAdminById } from "@src/db/query/artistAdmin/getArtistAdminById.types";
import { insertArtist } from "@src/db/query/artistAdmin/insertArtist.types";
import { listArtistsAdmin } from "@src/db/query/artistAdmin/listArtistsAdmin.types";
import { updateArtist } from "@src/db/query/artistAdmin/updateArtist.types";
import { approveBookingAdmin } from "@src/db/query/booking/approveBookingAdmin.types";
import { countBookingsAdmin } from "@src/db/query/booking/countBookingsAdmin.types";
import { listBookingsAdmin } from "@src/db/query/booking/listBookingsAdmin.types";
import { markBookingCompleted } from "@src/db/query/booking/markBookingCompleted.types";
import { markBookingDepositPaid } from "@src/db/query/booking/markBookingDepositPaid.types";
import { rejectBookingAdmin } from "@src/db/query/booking/rejectBookingAdmin.types";
import { listContentBlocks } from "@src/db/query/content/listContentBlocks.types";
import { upsertContentBlock } from "@src/db/query/content/upsertContentBlock.types";
import { deleteEngagementContractByArtist } from "@src/db/query/contract/deleteEngagementContractByArtist.types";
import { getContractById } from "@src/db/query/contract/getContractById.types";
import { getEngagementContractByArtist } from "@src/db/query/contract/getEngagementContractByArtist.types";
import { touchContractReminder } from "@src/db/query/contract/touchContractReminder.types";
import { upsertContract } from "@src/db/query/contract/upsertContract.types";
import { recordAudit } from "@src/helpers/audit";
import {
  ADMIN_REFRESH_COOKIE_PATH,
  clearAuthCookies,
  setAuthCookies,
} from "@src/helpers/authCookies";
import { config } from "@src/helpers/config";
import { AUTH_COOKIES } from "@src/helpers/constants";
import {
  AUDIT_ACTION,
  AUDIT_ACTOR_KIND,
  AUDIT_TARGET_KIND,
} from "@src/helpers/constants/domain";
import { AUTH_ERROR_CODES, HTTP_STATUS } from "@src/helpers/error/constants";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@src/helpers/error/errors";
import { validateRequest } from "@src/helpers/validation";
import { requireAdmin } from "@src/middleware/auth/requireKind";
import { authRateLimiter } from "@src/middleware/security/rateLimit";
import {
  adminArtistIdParamsSchema,
  adminArtistListQuerySchema,
  adminBookingApproveBodySchema,
  adminBookingCreateBodySchema,
  adminBookingListQuerySchema,
  adminBookingRejectBodySchema,
  adminBookingUpdateBodySchema,
  adminUnavailabilityCreateSchema,
  clientIdParamsSchema,
  contentBlockKeyParamsSchema,
  contentBlockUpdateSchema,
  createAdminArtistBodySchema,
  updateAdminArtistBodySchema,
} from "@src/schemas/adminArtist";
import { updateAgencyInfoBodySchema } from "@src/schemas/agency";
import { loginBodySchema } from "@src/schemas/artistAuth";
import {
  artistInvitationIdParamsSchema,
  createArtistInvitationBodySchema,
  listArtistInvitationsQuerySchema,
  resendArtistInvitationBodySchema,
} from "@src/schemas/artistInvitation";
import {
  type AgencyInfo,
  getAgencyInfo,
  saveAgencyInfo,
} from "@src/services/agency/agencyInfoService";
import {
  AGENCY_SIGNATURE_MIME_TYPES,
  getAgencySignatureDataUrl,
  getAgencySignaturePath,
  removeAgencySignature,
  saveAgencySignature,
} from "@src/services/agency/agencySignatureService";
import ArtistInvitationService, {
  type ArtistInvitationStatus,
  type ArtistLevel,
  type ArtistSetType,
} from "@src/services/artistInvitation/artistInvitationService";
import AdminAuthService from "@src/services/auth/adminAuthService";
import ClientAuthService from "@src/services/auth/clientAuthService";
import BookingService from "@src/services/bookings/bookingService";
import { renderContractPdf } from "@src/services/contract/contractPdfRenderer";
import { renderEngagementContractHtml } from "@src/services/contract/engagementContractTemplate";
import { downloadSignedEnvelope } from "@src/services/documenso/documensoClient";
import {
  EmailLocale,
  EmailTemplate,
  getEmailQueue,
} from "@src/services/mailer/queueService";
import { ArtistSetType as PricingSetType } from "@src/services/pricing/pricingConstants";
import UnavailabilityService from "@src/services/unavailability/unavailabilityService";
import { Router } from "express";
import multer from "multer";

const adminRouter = Router();
const adminAuth = new AdminAuthService(pool);
const bookingService = new BookingService(pool);
const clientAuthService = new ClientAuthService(pool);
const unavailabilityService = new UnavailabilityService(pool);
const artistInvitationService = new ArtistInvitationService(pool);

// Postgres unique-violation code. Used to translate a duplicate artist slug into
// a 409 instead of leaking a 500 (#29).
const PG_UNIQUE_VIOLATION = "23505";
const mapSlugConflict = (error: unknown): unknown => {
  if ((error as { code?: string } | null)?.code === PG_UNIQUE_VIOLATION) {
    return new ConflictError("slug already in use");
  }
  return error;
};

// Public sub-routes (login)
adminRouter.post(
  "/auth/login",
  authRateLimiter,
  validateRequest({ body: loginBodySchema }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };
      const { token, refreshToken, admin } = await adminAuth.login(
        email,
        password,
      );
      setAuthCookies(res, AUTH_COOKIES.ADMIN, ADMIN_REFRESH_COOKIE_PATH, {
        accessToken: token,
        refreshToken,
      });
      res.status(HTTP_STATUS.OK).json({ admin });
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.post("/auth/refresh", authRateLimiter, async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[AUTH_COOKIES.ADMIN.REFRESH];
    if (!refreshToken) {
      throw new UnauthorizedError(AUTH_ERROR_CODES.INVALID_TOKEN);
    }
    const {
      token,
      refreshToken: rotated,
      admin,
    } = await adminAuth.refresh(refreshToken);
    setAuthCookies(res, AUTH_COOKIES.ADMIN, ADMIN_REFRESH_COOKIE_PATH, {
      accessToken: token,
      refreshToken: rotated,
    });
    res.status(HTTP_STATUS.OK).json({ admin });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/auth/logout", async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[AUTH_COOKIES.ADMIN.REFRESH];
    if (refreshToken) {
      await adminAuth.logout(refreshToken);
    }
    clearAuthCookies(res, AUTH_COOKIES.ADMIN, ADMIN_REFRESH_COOKIE_PATH);
    res.status(HTTP_STATUS.NO_CONTENT).end();
  } catch (error) {
    next(error);
  }
});

// All routes below require admin JWT.
adminRouter.use(requireAdmin);

// Current admin resolved from the access-token cookie (for SPA hydrate()).
adminRouter.get("/auth/me", (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    id: req.identity?.sub,
    email: req.identity?.data,
    fullName: req.identity?.displayName,
  });
});

// --- Agency settings (signature pre-rendered on engagement contracts) ---
const AGENCY_SIGNATURE_MAX_BYTES = 2 * 1024 * 1024;
const signatureUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AGENCY_SIGNATURE_MAX_BYTES },
});

adminRouter.get("/agency/signature", async (_req, res, next) => {
  try {
    const [dataUrl, path] = await Promise.all([
      getAgencySignatureDataUrl(),
      getAgencySignaturePath(),
    ]);
    res.status(HTTP_STATUS.OK).json({
      signature_image_data_url: dataUrl,
      has_signature: Boolean(path),
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.put(
  "/agency/signature",
  signatureUpload.single("signature"),
  async (req, res, next) => {
    try {
      const file = (req as unknown as { file?: Express.Multer.File }).file;
      if (!file) throw new ValidationError("Missing signature file");
      if (!AGENCY_SIGNATURE_MIME_TYPES.has(file.mimetype)) {
        throw new ValidationError("Unsupported signature image format");
      }

      const relativePath = await saveAgencySignature(
        file.buffer,
        file.mimetype,
      );
      const dataUrl = await getAgencySignatureDataUrl();

      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity?.sub,
        action: AUDIT_ACTION.AGENCY_SIGNATURE_UPDATE,
        targetKind: AUDIT_TARGET_KIND.AGENCY_SETTINGS,
        metadata: { relativePath, mimetype: file.mimetype, bytes: file.size },
      });

      res.status(HTTP_STATUS.OK).json({
        signature_image_data_url: dataUrl,
        has_signature: true,
      });
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.delete("/agency/signature", async (req, res, next) => {
  try {
    await removeAgencySignature();

    await recordAudit({
      actorKind: AUDIT_ACTOR_KIND.ADMIN,
      actorId: req.identity?.sub,
      action: AUDIT_ACTION.AGENCY_SIGNATURE_REMOVE,
      targetKind: AUDIT_TARGET_KIND.AGENCY_SETTINGS,
    });

    res
      .status(HTTP_STATUS.OK)
      .json({ signature_image_data_url: null, has_signature: false });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/agency/info", async (_req, res, next) => {
  try {
    const info = await getAgencyInfo();
    res.status(HTTP_STATUS.OK).json(info);
  } catch (error) {
    next(error);
  }
});

const pickAgencyInfo = (body: Record<string, unknown>): AgencyInfo => {
  const str = (key: string): string | null => {
    const value = body[key];
    return typeof value === "string" ? value : null;
  };
  return {
    name: str("name"),
    representative: str("representative"),
    address: str("address"),
    city: str("city"),
    companyNumber: str("companyNumber"),
    vatNumber: str("vatNumber"),
    email: str("email"),
    iban: str("iban"),
  };
};

adminRouter.put(
  "/agency/info",
  validateRequest({ body: updateAgencyInfoBodySchema }),
  async (req, res, next) => {
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const info = await saveAgencyInfo(pickAgencyInfo(body));

      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity?.sub,
        action: AUDIT_ACTION.AGENCY_INFO_UPDATE,
        targetKind: AUDIT_TARGET_KIND.AGENCY_SETTINGS,
      });

      res.status(HTTP_STATUS.OK).json(info);
    } catch (error) {
      next(error);
    }
  },
);

// --- Artists CRUD (S-22) ---
adminRouter.get(
  "/artists",
  validateRequest({ query: adminArtistListQuerySchema }),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as {
        q?: string;
        page: number;
        page_size: number;
      };
      const offset = (query.page - 1) * query.page_size;
      const [rows, countRows] = await Promise.all([
        listArtistsAdmin.run(
          {
            searchTerm: query.q ?? null,
            pageLimit: query.page_size,
            pageOffset: offset,
          },
          pool,
        ),
        countArtistsAdmin.run({ searchTerm: query.q ?? null }, pool),
      ]);
      res.status(HTTP_STATUS.OK).json({
        data: rows,
        pagination: {
          page: query.page,
          pageSize: query.page_size,
          total: countRows[0]?.total ?? 0,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.get(
  "/artists/:id",
  validateRequest({ params: adminArtistIdParamsSchema }),
  async (req, res, next) => {
    try {
      const rows = await getArtistAdminById.run(
        { artistId: req.params.id as string },
        pool,
      );
      if (rows.length === 0) {
        throw new NotFoundError("Artist not found");
      }
      res.status(HTTP_STATUS.OK).json(rows[0]);
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.post(
  "/artists",
  validateRequest({ body: createAdminArtistBodySchema }),
  async (req, res, next) => {
    try {
      const body = req.body as {
        slug: string;
        stageName: string;
        bioFr?: string;
        bioNl?: string;
        bioEn?: string;
        genre?: string;
        isPublished: boolean;
        isFeatured: boolean;
        coverImageUrl?: string;
      };
      const rows = await insertArtist.run(
        {
          slug: body.slug,
          stageName: body.stageName,
          bioFr: body.bioFr ?? null,
          bioNl: body.bioNl ?? null,
          bioEn: body.bioEn ?? null,
          genre: body.genre ?? null,
          isPublished: body.isPublished,
          isFeatured: body.isFeatured,
          coverImageUrl: body.coverImageUrl ?? null,
        },
        pool,
      );
      const inserted = rows[0];
      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity?.sub,
        action: AUDIT_ACTION.ARTIST_CREATE,
        targetKind: AUDIT_TARGET_KIND.ARTIST,
        targetId: inserted.id,
      });
      res.status(HTTP_STATUS.CREATED).json(inserted);
    } catch (error) {
      // #29 — a duplicate slug hits the UNIQUE index; surface a 409 instead of 500.
      next(mapSlugConflict(error));
    }
  },
);

adminRouter.put(
  "/artists/:id",
  validateRequest({
    params: adminArtistIdParamsSchema,
    body: updateAdminArtistBodySchema,
  }),
  async (req, res, next) => {
    try {
      const body = req.body as Record<string, unknown>;
      const rows = await updateArtist.run(
        {
          artistId: req.params.id as string,
          slug: (body.slug as string | undefined) ?? null,
          stageName: (body.stageName as string | undefined) ?? null,
          bioFr: (body.bioFr as string | null | undefined) ?? null,
          bioNl: (body.bioNl as string | null | undefined) ?? null,
          bioEn: (body.bioEn as string | null | undefined) ?? null,
          genre: (body.genre as string | null | undefined) ?? null,
          isPublished: (body.isPublished as boolean | undefined) ?? null,
          isFeatured: (body.isFeatured as boolean | undefined) ?? null,
          coverImageUrl:
            (body.coverImageUrl as string | null | undefined) ?? null,
          level: (body.level as "L1" | "L2" | "L3" | "L4" | undefined) ?? null,
        },
        pool,
      );
      if (rows.length === 0) throw new NotFoundError("Artist not found");
      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity?.sub,
        action: AUDIT_ACTION.ARTIST_UPDATE,
        targetKind: AUDIT_TARGET_KIND.ARTIST,
        targetId: req.params.id as string,
      });
      res.status(HTTP_STATUS.OK).json(rows[0]);
    } catch (error) {
      // #29 — a duplicate slug hits the UNIQUE index; surface a 409 instead of 500.
      next(mapSlugConflict(error));
    }
  },
);

adminRouter.delete(
  "/artists/:id",
  validateRequest({ params: adminArtistIdParamsSchema }),
  async (req, res, next) => {
    try {
      const counts = await countArtistActiveBookings.run(
        { artistId: req.params.id as string },
        pool,
      );
      if ((counts[0]?.total ?? 0) > 0) {
        throw new ConflictError(
          "Artist has active bookings and cannot be deleted",
        );
      }
      const rows = await deleteArtist.run(
        { artistId: req.params.id as string },
        pool,
      );
      if (rows.length === 0) throw new NotFoundError("Artist not found");
      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity?.sub,
        action: AUDIT_ACTION.ARTIST_DELETE,
        targetKind: AUDIT_TARGET_KIND.ARTIST,
        targetId: req.params.id as string,
      });
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
);

// --- Artist invitations (magic-link onboarding) ---

adminRouter.post(
  "/artist-invitations",
  validateRequest({ body: createArtistInvitationBodySchema }),
  async (req, res, next) => {
    try {
      if (!req.identity) throw new ForbiddenError("Missing admin identity");
      const body = req.body as {
        email: string;
        stageName: string;
        level: ArtistLevel;
        setType: ArtistSetType;
        customMessage?: string;
        locale: EmailLocale;
      };
      const result = await artistInvitationService.create({
        email: body.email,
        stageName: body.stageName,
        level: body.level,
        setType: body.setType,
        customMessage: body.customMessage,
        locale: body.locale,
        invitedBy: req.identity.sub,
      });
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.get(
  "/artist-invitations",
  validateRequest({ query: listArtistInvitationsQuerySchema }),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as {
        status?: ArtistInvitationStatus;
        q?: string;
        page: number;
        page_size: number;
      };
      const result = await artistInvitationService.list({
        status: query.status,
        search: query.q,
        page: query.page,
        pageSize: query.page_size,
      });
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.post(
  "/artist-invitations/:id/resend",
  validateRequest({
    params: artistInvitationIdParamsSchema,
    body: resendArtistInvitationBodySchema,
  }),
  async (req, res, next) => {
    try {
      if (!req.identity) throw new ForbiddenError("Missing admin identity");
      const body = req.body as { locale: EmailLocale; skipEmail: boolean };
      const result = await artistInvitationService.resend(
        req.params.id as string,
        body.locale,
        req.identity.sub,
        body.skipEmail,
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.post(
  "/artist-invitations/:id/revoke",
  validateRequest({ params: artistInvitationIdParamsSchema }),
  async (req, res, next) => {
    try {
      if (!req.identity) throw new ForbiddenError("Missing admin identity");
      const result = await artistInvitationService.revoke(
        req.params.id as string,
        req.identity.sub,
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// --- Engagement contract management (admin) ---

adminRouter.post(
  "/artists/:id/engagement-contract/reset",
  validateRequest({ params: adminArtistIdParamsSchema }),
  async (req, res, next) => {
    try {
      const artistId = req.params.id as string;

      // Order matters: artists.engagement_contract_id has a FK to contracts.id
      // with no ON DELETE clause, so we must NULL the link first before we
      // can delete the contract row itself.
      await resetArtistOnboarding.run({ artistId }, pool);
      const deleted = await deleteEngagementContractByArtist.run(
        { artistId },
        pool,
      );

      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity?.sub,
        action: AUDIT_ACTION.ENGAGEMENT_CONTRACT_RESET,
        targetKind: AUDIT_TARGET_KIND.ARTIST,
        targetId: artistId,
        metadata: { deletedContractIds: deleted.map((r) => r.id) },
      });

      res.status(HTTP_STATUS.OK).json({ ok: true, deleted: deleted.length });
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.get(
  "/artists/:id/engagement-contract/download",
  validateRequest({ params: adminArtistIdParamsSchema }),
  async (req, res, next) => {
    try {
      const artistId = req.params.id as string;

      const profileRows = await getArtistSelfProfile.run({ artistId }, pool);
      if (profileRows.length === 0) throw new NotFoundError("Artist not found");
      const profile = profileRows[0];

      const contractRows = await getEngagementContractByArtist.run(
        { artistId },
        pool,
      );
      const contract = contractRows[0];

      // Already signed → fetch the signed PDF from Documenso.
      if (
        contract?.status === "signed" &&
        contract.signature_provider_envelope_id
      ) {
        const pdf = await downloadSignedEnvelope(
          config.documenso.url,
          config.documenso.apiKey,
          contract.signature_provider_envelope_id,
          config.documenso.minioLocalEndpoint || undefined,
        );
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="engagement-${profile.slug}-signed.pdf"`,
        );
        res.send(pdf);
        return;
      }

      // Otherwise render the current draft on the fly (same template the
      // artist would sign on the next click).
      const accountRows = await getArtistAccountById.run({ artistId }, pool);
      const email = accountRows[0]?.email ?? "";
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
        email,
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
      const pdf = await renderContractPdf({ htmlContent: html, title });

      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity?.sub,
        action: AUDIT_ACTION.ENGAGEMENT_CONTRACT_DOWNLOAD_DRAFT,
        targetKind: AUDIT_TARGET_KIND.ARTIST,
        targetId: artistId,
        metadata: { signer: signerName },
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="engagement-${profile.slug}-draft.pdf"`,
      );
      res.send(pdf);
    } catch (error) {
      next(error);
    }
  },
);

// --- Bookings (S-23, S-24) ---

// Manual booking creation by the admin. Always lands on a client_account
// (existing or newly created stub) so the booking can later surface in the
// client dashboard when they claim/sign up with the same email.
adminRouter.post(
  "/bookings",
  validateRequest({ body: adminBookingCreateBodySchema }),
  async (req, res, next) => {
    try {
      const body = req.body as {
        artistId: string;
        clientName: string;
        clientEmail?: string;
        clientPhone?: string;
        eventDate: string;
        eventDurationHours: number;
        eventLocation: string;
        context?: string;
        capacity: number;
        ticketPriceCents: number;
        setType: "dj" | "hybrid" | "live";
        quotedTotalCents?: number;
        depositAmountCents?: number;
        initialStatus?: string;
        internalNote?: string;
        skipEmails: boolean;
        overrideConflict: boolean;
        locale: EmailLocale;
      };

      const client = await clientAuthService.findOrCreateStubClient({
        displayName: body.clientName,
        email: body.clientEmail,
        phone: body.clientPhone,
      });

      const result = await bookingService.createForAdmin({
        artistId: body.artistId,
        clientAccountId: client.id,
        client: {
          name: body.clientName,
          email: client.email,
          phone: body.clientPhone ?? null,
        },
        eventDate: body.eventDate,
        durationHours: body.eventDurationHours,
        locationAddress: body.eventLocation,
        context: body.context,
        capacity: body.capacity,
        ticketPriceCents: body.ticketPriceCents,
        setType: body.setType as PricingSetType,
        initialStatus: body.initialStatus,
        quotedTotalCents: body.quotedTotalCents,
        depositAmountCents: body.depositAmountCents,
        internalNote: body.internalNote,
        skipEmails: body.skipEmails,
        overrideConflict: body.overrideConflict,
        locale: body.locale,
      });

      res.status(HTTP_STATUS.CREATED).json({
        id: result.id,
        status: result.status,
        clientAccountId: client.id,
        clientEmail: client.email,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Sends a claim-your-account email to a stub client. No-op if the client is
// already claimed; errors out if no email is on file.
adminRouter.post(
  "/clients/:id/invite",
  validateRequest({ params: clientIdParamsSchema }),
  async (req, res, next) => {
    try {
      const locale =
        (req.body as { locale?: EmailLocale } | undefined)?.locale ?? "fr";
      await clientAuthService.inviteClient(req.params.id as string, locale);
      res.status(HTTP_STATUS.OK).json({ message: "ok" });
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.get(
  "/bookings",
  validateRequest({ query: adminBookingListQuerySchema }),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as {
        status?: string;
        artist_id?: string;
        page: number;
        page_size: number;
      };
      const offset = (query.page - 1) * query.page_size;
      const [rows, countRows] = await Promise.all([
        listBookingsAdmin.run(
          {
            statusFilter: query.status ?? null,
            artistId: query.artist_id ?? null,
            pageLimit: query.page_size,
            pageOffset: offset,
          },
          pool,
        ),
        countBookingsAdmin.run(
          {
            statusFilter: query.status ?? null,
            artistId: query.artist_id ?? null,
          },
          pool,
        ),
      ]);
      res.status(HTTP_STATUS.OK).json({
        data: rows,
        pagination: {
          page: query.page,
          pageSize: query.page_size,
          total: countRows[0]?.total ?? 0,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Admin booking detail. No RGPD masking here: the admin needs the client's
// contact info to reach out, regardless of payment status.
adminRouter.get(
  "/bookings/:id",
  validateRequest({ params: adminArtistIdParamsSchema }),
  async (req, res, next) => {
    try {
      const booking = await bookingService.getById(req.params.id as string);
      res.status(HTTP_STATUS.OK).json({
        id: booking.id,
        status: booking.status,
        artistId: booking.artist_id,
        artistSlug: booking.artist_slug,
        artistStageName: booking.artist_stage_name,
        eventDate: booking.event_date,
        eventDurationHours: booking.event_duration_hours,
        eventLocation: booking.event_location_address,
        eventLocationLat: booking.event_location_lat,
        eventLocationLng: booking.event_location_lng,
        eventContext: booking.event_context,
        options: booking.options,
        quotedTotalCents: booking.quoted_total_cents,
        depositAmountCents: booking.deposit_amount_cents,
        client: {
          name: booking.client_name,
          email: booking.client_email,
          phone: booking.client_phone,
          locale: booking.client_locale,
          accountId: booking.client_account_id,
          accountEmail: booking.client_account_email,
          claimedAt: booking.client_claimed_at,
        },
        adminApprovedAt: booking.admin_approved_at,
        paidAt: booking.paid_at,
        cancelReason: booking.cancel_reason,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Admin partial-edit of a booking request. Updates only the fields the admin
// changes in the modal; status transitions stay on the dedicated workflow
// endpoints (approve / reject / mark-* / etc.).
adminRouter.put(
  "/bookings/:id",
  validateRequest({
    params: adminArtistIdParamsSchema,
    body: adminBookingUpdateBodySchema,
  }),
  async (req, res, next) => {
    try {
      const body = req.body as {
        eventDate?: string;
        eventDurationHours?: number;
        eventLocationAddress?: string;
        eventContext?: string | null;
        quotedTotalCents?: number;
        depositAmountCents?: number;
        overrideConflict?: boolean;
      };
      // #9 — routed through the service: overlap/unavailability re-check on a
      // date/duration change plus the deposit<=total guard live there.
      const updated = await bookingService.updateForAdmin(
        req.params.id as string,
        {
          eventDate: body.eventDate,
          eventDurationHours: body.eventDurationHours,
          eventLocationAddress: body.eventLocationAddress,
          eventContext: body.eventContext,
          quotedTotalCents: body.quotedTotalCents,
          depositAmountCents: body.depositAmountCents,
          overrideConflict: body.overrideConflict,
        },
      );
      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity?.sub,
        action: AUDIT_ACTION.BOOKING_UPDATE,
        targetKind: AUDIT_TARGET_KIND.BOOKING,
        targetId: req.params.id as string,
        metadata: { fields: Object.keys(body) },
      });
      res.status(HTTP_STATUS.OK).json(updated);
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.post(
  "/bookings/:id/approve",
  validateRequest({
    params: adminArtistIdParamsSchema,
    body: adminBookingApproveBodySchema,
  }),
  async (req, res, next) => {
    try {
      const approveBody = req.body as { note?: string };
      // #24 — re-check unavailability before committing the transition: an
      // unavailability added after the request was submitted must block approval.
      const current = await bookingService.getById(req.params.id as string);
      await bookingService.assertNoUnavailabilityConflict(current);

      const rows = await approveBookingAdmin.run(
        { bookingId: req.params.id as string },
        pool,
      );
      if (rows.length === 0) {
        throw new ConflictError("Booking already approved");
      }
      const booking = await bookingService.getById(req.params.id as string);
      const locale = (booking.client_locale ?? "fr") as EmailLocale;
      if (booking.client_email) {
        await getEmailQueue().enqueue({
          template: EmailTemplate.BOOKING_APPROVED,
          recipient: booking.client_email,
          locale,
          payload: {
            clientName: booking.client_name ?? "",
            artistStageName: booking.artist_stage_name,
            eventDate: booking.event_date,
          },
        });
      }
      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity?.sub,
        action: AUDIT_ACTION.BOOKING_APPROVE,
        targetKind: AUDIT_TARGET_KIND.BOOKING,
        targetId: req.params.id as string,
        // #27 — persist the admin's approval note instead of discarding it.
        ...(approveBody.note ? { metadata: { note: approveBody.note } } : {}),
      });
      res.status(HTTP_STATUS.OK).json(rows[0]);
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.post(
  "/bookings/:id/reject",
  validateRequest({
    params: adminArtistIdParamsSchema,
    body: adminBookingRejectBodySchema,
  }),
  async (req, res, next) => {
    try {
      const body = req.body as { reason?: string };
      const reason = body.reason ?? "";
      const rows = await rejectBookingAdmin.run(
        { bookingId: req.params.id as string, reason },
        pool,
      );
      if (rows.length === 0) {
        throw new ConflictError("Booking cannot be rejected");
      }
      const booking = await bookingService.getById(req.params.id as string);
      const locale = (booking.client_locale ?? "fr") as EmailLocale;
      if (booking.client_email) {
        await getEmailQueue().enqueue({
          template: EmailTemplate.BOOKING_REJECTED,
          recipient: booking.client_email,
          locale,
          payload: {
            clientName: booking.client_name ?? "",
            reason,
          },
        });
      }
      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity?.sub,
        action: AUDIT_ACTION.BOOKING_REJECT,
        targetKind: AUDIT_TARGET_KIND.BOOKING,
        targetId: req.params.id as string,
        metadata: { reason },
      });
      res.status(HTTP_STATUS.OK).json(rows[0]);
    } catch (error) {
      next(error);
    }
  },
);

// Admin manually flips a booking from `awaiting_deposit` to `confirmed` once
// the deposit has been received off-platform (bank transfer, cash, etc.).
adminRouter.post(
  "/bookings/:id/mark-deposit-paid",
  validateRequest({ params: adminArtistIdParamsSchema }),
  async (req, res, next) => {
    try {
      // #24 — re-check unavailability before confirming: the slot must still be
      // free of any unavailability window added since the booking was approved.
      const current = await bookingService.getById(req.params.id as string);
      await bookingService.assertNoUnavailabilityConflict(current);

      const rows = await markBookingDepositPaid.run(
        { bookingId: req.params.id as string },
        pool,
      );
      if (rows.length === 0) {
        throw new ConflictError(
          "Booking must be in awaiting_deposit to mark deposit paid",
        );
      }
      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity?.sub,
        action: AUDIT_ACTION.BOOKING_MARK_DEPOSIT_PAID,
        targetKind: AUDIT_TARGET_KIND.BOOKING,
        targetId: req.params.id as string,
      });
      res.status(HTTP_STATUS.OK).json(rows[0]);
    } catch (error) {
      next(error);
    }
  },
);

// Admin closes the booking: event is over and the balance was received. Moves
// `confirmed` -> `completed` and stamps `paid_at`.
adminRouter.post(
  "/bookings/:id/mark-completed",
  validateRequest({ params: adminArtistIdParamsSchema }),
  async (req, res, next) => {
    try {
      const rows = await markBookingCompleted.run(
        { bookingId: req.params.id as string },
        pool,
      );
      if (rows.length === 0) {
        throw new ConflictError(
          "Booking must be confirmed before it can be marked completed",
        );
      }
      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity?.sub,
        action: AUDIT_ACTION.BOOKING_MARK_COMPLETED,
        targetKind: AUDIT_TARGET_KIND.BOOKING,
        targetId: req.params.id as string,
      });
      res.status(HTTP_STATUS.OK).json(rows[0]);
    } catch (error) {
      next(error);
    }
  },
);

// --- Contracts (S-29, S-30) ---
adminRouter.post(
  "/bookings/:id/contract",
  validateRequest({ params: adminArtistIdParamsSchema }),
  async (req, res, next) => {
    try {
      const body = req.body as { pdfStorageKey?: string };
      if (!body.pdfStorageKey || typeof body.pdfStorageKey !== "string") {
        throw new ValidationError("pdfStorageKey is required");
      }
      const booking = await bookingService.getById(req.params.id as string);
      if (booking.status !== "confirmed") {
        throw new ConflictError(
          "Booking must be confirmed before uploading a contract",
        );
      }
      const rows = await upsertContract.run(
        { bookingId: booking.id, pdfStorageKey: body.pdfStorageKey },
        pool,
      );
      const contract = rows[0];
      if (booking.client_email) {
        await getEmailQueue().enqueue({
          template: EmailTemplate.CONTRACT_READY,
          recipient: booking.client_email,
          locale: (booking.client_locale ?? "fr") as EmailLocale,
          payload: { bookingId: booking.id, contractId: contract.id },
        });
      }
      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity?.sub,
        action: AUDIT_ACTION.CONTRACT_UPLOAD,
        targetKind: AUDIT_TARGET_KIND.CONTRACT,
        targetId: contract.id,
      });
      res.status(HTTP_STATUS.CREATED).json(contract);
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.post(
  "/contracts/:id/remind",
  validateRequest({ params: adminArtistIdParamsSchema }),
  async (req, res, next) => {
    try {
      const contractRows = await getContractById.run(
        { contractId: req.params.id as string },
        pool,
      );
      if (contractRows.length === 0)
        throw new NotFoundError("Contract not found");
      const contract = contractRows[0];
      const touched = await touchContractReminder.run(
        { contractId: contract.id },
        pool,
      );
      if (touched.length === 0) {
        throw new ConflictError("Reminder rate limit (24h) reached");
      }
      if (!contract.booking_id) {
        throw new NotFoundError("Booking not found for contract");
      }
      const booking = await bookingService.getById(contract.booking_id);
      if (booking.client_email) {
        await getEmailQueue().enqueue({
          template: EmailTemplate.CONTRACT_REMINDER,
          recipient: booking.client_email,
          locale: (booking.client_locale ?? "fr") as EmailLocale,
          payload: { bookingId: booking.id, contractId: contract.id },
        });
      }
      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity?.sub,
        action: AUDIT_ACTION.CONTRACT_REMIND,
        targetKind: AUDIT_TARGET_KIND.CONTRACT,
        targetId: contract.id,
      });
      res.status(HTTP_STATUS.OK).json({ message: "Reminder sent" });
    } catch (error) {
      next(error);
    }
  },
);

// --- Unavailabilities (S-28) ---
adminRouter.post(
  "/unavailabilities",
  validateRequest({ body: adminUnavailabilityCreateSchema }),
  async (req, res, next) => {
    try {
      if (!req.identity) throw new ForbiddenError("Missing admin identity");
      const body = req.body as {
        artistId: string;
        startsAt: string;
        endsAt: string;
        source: "personal" | "external_gig";
        externalEventTitle?: string;
        externalEventLocation?: string;
        notes?: string;
      };
      const created = await unavailabilityService.create({
        artistId: body.artistId,
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity.sub,
        input: {
          startsAt: body.startsAt,
          endsAt: body.endsAt,
          source: body.source,
          externalEventTitle: body.externalEventTitle,
          externalEventLocation: body.externalEventLocation,
          notes: body.notes,
        },
      });
      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity.sub,
        action: AUDIT_ACTION.UNAVAILABILITY_CREATE,
        targetKind: AUDIT_TARGET_KIND.UNAVAILABILITY,
        targetId: created.id,
      });
      res.status(HTTP_STATUS.CREATED).json(created);
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.delete(
  "/unavailabilities/:id",
  validateRequest({ params: adminArtistIdParamsSchema }),
  async (req, res, next) => {
    try {
      if (!req.identity) throw new ForbiddenError("Missing admin identity");
      await unavailabilityService.deleteForArtist({
        unavailabilityId: req.params.id as string,
        artistId: "00000000-0000-0000-0000-000000000000",
        enforceArtistOwnership: false,
      });
      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity.sub,
        action: AUDIT_ACTION.UNAVAILABILITY_DELETE,
        targetKind: AUDIT_TARGET_KIND.UNAVAILABILITY,
        targetId: req.params.id as string,
      });
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
);

// --- Content blocks (EPIC-06) ---
adminRouter.get("/content", async (_req, res, next) => {
  try {
    const rows = await listContentBlocks.run(undefined, pool);
    res.status(HTTP_STATUS.OK).json({ data: rows });
  } catch (error) {
    next(error);
  }
});

adminRouter.put(
  "/content/:key",
  validateRequest({
    params: contentBlockKeyParamsSchema,
    body: contentBlockUpdateSchema,
  }),
  async (req, res, next) => {
    try {
      if (!req.identity) throw new ForbiddenError("Missing admin identity");
      const body = req.body as {
        valueFr?: string;
        valueNl?: string;
        valueEn?: string;
      };
      const rows = await upsertContentBlock.run(
        {
          key: req.params.key as string,
          valueFr: body.valueFr ?? null,
          valueNl: body.valueNl ?? null,
          valueEn: body.valueEn ?? null,
          updatedBy: req.identity.sub,
        },
        pool,
      );
      await recordAudit({
        actorKind: AUDIT_ACTOR_KIND.ADMIN,
        actorId: req.identity.sub,
        action: AUDIT_ACTION.CONTENT_UPDATE,
        targetKind: AUDIT_TARGET_KIND.CONTENT_BLOCK,
        targetId: null,
        metadata: { key: req.params.key as string },
      });
      res.status(HTTP_STATUS.OK).json(rows[0]);
    } catch (error) {
      next(error);
    }
  },
);

export default adminRouter;
