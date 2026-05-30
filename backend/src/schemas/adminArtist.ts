import { ARTIST_LEVELS, ARTIST_SET_TYPES } from "@src/helpers/constants/artist";
import { z } from "zod";

const slugRegex = /^[a-z0-9-]+$/;

export const createAdminArtistBodySchema = z.object({
  slug: z.string().trim().min(2).max(120).regex(slugRegex),
  stageName: z.string().trim().min(2).max(150),
  bioFr: z.string().trim().max(5000).optional(),
  bioNl: z.string().trim().max(5000).optional(),
  bioEn: z.string().trim().max(5000).optional(),
  genre: z.string().trim().max(50).optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  coverImageUrl: z.url().optional(),
  level: z.enum(ARTIST_LEVELS).optional(),
});

export const updateAdminArtistBodySchema = z.object({
  slug: z.string().trim().min(2).max(120).regex(slugRegex).optional(),
  stageName: z.string().trim().min(2).max(150).optional(),
  bioFr: z.string().trim().max(5000).nullish(),
  bioNl: z.string().trim().max(5000).nullish(),
  bioEn: z.string().trim().max(5000).nullish(),
  genre: z.string().trim().max(50).nullish(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  coverImageUrl: z.url().nullish(),
  level: z.enum(ARTIST_LEVELS).optional(),
});

export const adminArtistIdParamsSchema = z.object({
  id: z.guid(),
});

export const adminArtistListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(25),
});

export const adminBookingApproveBodySchema = z.object({
  note: z.string().trim().max(1000).optional(),
});

export const adminBookingRejectBodySchema = z.object({
  // The rejection reason is optional: an admin can cancel a booking without
  // giving an explanation. When provided it stays bounded for the email/audit.
  reason: z.string().trim().max(1000).optional(),
});

export const adminBookingListQuerySchema = z.object({
  status: z.string().trim().max(40).optional(),
  artist_id: z.guid().optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(25),
});

export const adminBookingCreateBodySchema = z.object({
  artistId: z.guid(),
  clientName: z.string().trim().min(1).max(200),
  clientEmail: z.string().trim().max(200).optional(),
  clientPhone: z.string().trim().max(50).optional(),
  eventDate: z.iso.datetime({ offset: true }),
  eventDurationHours: z.number().positive().max(48),
  eventLocation: z.string().trim().min(1).max(500),
  context: z.string().trim().max(2000).optional(),
  capacity: z.number().int().nonnegative().max(1_000_000),
  ticketPriceCents: z.number().int().nonnegative().max(1_000_000_00),
  setType: z.enum(ARTIST_SET_TYPES),
  quotedTotalCents: z
    .number()
    .int()
    .nonnegative()
    .max(10_000_000_00)
    .optional(),
  depositAmountCents: z
    .number()
    .int()
    .nonnegative()
    .max(10_000_000_00)
    .optional(),
  initialStatus: z
    .enum([
      "pending_validation",
      "awaiting_deposit",
      "confirmed",
      "cancelled",
      "completed",
    ])
    .optional(),
  skipEmails: z.boolean().default(false),
  overrideConflict: z.boolean().default(false),
  locale: z.enum(["fr", "nl", "en"]).default("fr"),
});

export const clientIdParamsSchema = z.object({
  id: z.guid(),
});

export const adminBookingUpdateBodySchema = z
  .object({
    eventDate: z.iso.datetime({ offset: true }).optional(),
    eventDurationHours: z.number().positive().max(48).optional(),
    eventLocationAddress: z.string().trim().min(1).max(500).optional(),
    eventContext: z.string().trim().max(2000).nullish(),
    quotedTotalCents: z
      .number()
      .int()
      .nonnegative()
      .max(10_000_000_00)
      .optional(),
    depositAmountCents: z
      .number()
      .int()
      .nonnegative()
      .max(10_000_000_00)
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const contentBlockUpdateSchema = z.object({
  valueFr: z.string().max(10000).optional(),
  valueNl: z.string().max(10000).optional(),
  valueEn: z.string().max(10000).optional(),
});

export const contentBlockKeyParamsSchema = z.object({
  key: z.string().trim().min(1).max(120),
});

export const adminUnavailabilityCreateSchema = z.object({
  artistId: z.guid(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  source: z.enum(["personal", "external_gig"]),
  externalEventTitle: z.string().trim().max(200).optional(),
  externalEventLocation: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
});
