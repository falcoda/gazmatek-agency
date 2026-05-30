import { passwordSchema } from "@src/helpers/auth/passwordPolicy";
import { z } from "zod";

// Artist self-service area schemas (S-49 and related). Validation is wired at
// the route level via validateRequest so controllers consume parsed data only.

const SUPPORTED_LANGS = ["fr", "nl", "en"] as const;

// PATCH /api/artist/profile — every field is optional; absent fields are left
// untouched. social_links is a free-form object persisted as JSON.
export const updateArtistProfileBodySchema = z.object({
  bio_fr: z.string().trim().max(5000).nullish(),
  bio_nl: z.string().trim().max(5000).nullish(),
  bio_en: z.string().trim().max(5000).nullish(),
  technical_info_fr: z.string().trim().max(5000).nullish(),
  technical_info_nl: z.string().trim().max(5000).nullish(),
  technical_info_en: z.string().trim().max(5000).nullish(),
  social_links: z.record(z.string(), z.unknown()).nullish(),
  cover_image_url: z.url().max(1000).nullish(),
  full_name: z.string().trim().max(200).nullish(),
  phone: z.string().trim().max(50).nullish(),
  address: z.string().trim().max(500).nullish(),
  country: z.string().trim().max(100).nullish(),
  vat_number: z.string().trim().max(50).nullish(),
  company_number: z.string().trim().max(50).nullish(),
});

// POST /api/artist/profile/password
export const changeArtistPasswordBodySchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: passwordSchema(),
});

// GET /api/artist/bookings
export const listArtistBookingsQuerySchema = z.object({
  tab: z.enum(["upcoming", "past"]).default("upcoming"),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(50).default(25),
});

// GET /api/artist/unavailabilities
export const listArtistUnavailabilitiesQuerySchema = z.object({
  from: z.iso.datetime({ offset: true }).optional(),
  to: z.iso.datetime({ offset: true }).optional(),
});

// :id path params reused by booking/contract sub-resources.
export const artistAreaBookingIdParamsSchema = z.object({
  id: z.guid(),
});

export const artistAreaContractIdParamsSchema = z.object({
  id: z.guid(),
});

export type UpdateArtistProfileBody = z.infer<
  typeof updateArtistProfileBodySchema
>;
export type ChangeArtistPasswordBody = z.infer<
  typeof changeArtistPasswordBodySchema
>;
export type ListArtistBookingsQuery = z.infer<
  typeof listArtistBookingsQuerySchema
>;
export type ListArtistUnavailabilitiesQuery = z.infer<
  typeof listArtistUnavailabilitiesQuerySchema
>;

export const ARTIST_AREA_LANGS = SUPPORTED_LANGS;
