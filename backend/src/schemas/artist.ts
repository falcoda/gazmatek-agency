import { z } from "zod";

const SUPPORTED_LANGS = ["fr", "nl", "en"] as const;
const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 24;

const optionalBool = z
  .union([z.boolean(), z.literal("true"), z.literal("false")])
  .transform((value) => value === true || value === "true")
  .optional();

export const listArtistsQuerySchema = z.object({
  featured: optionalBool,
  genre: z.string().trim().min(1).max(50).optional(),
  // NOTE: price/availability filters (min_price, max_price, available_on) are
  // intentionally not exposed: listArtistsWithFilters.sql only supports
  // featured + genre. Add them here (and in the SQL + Swagger) together.
  lang: z.enum(SUPPORTED_LANGS).optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).optional(),
});

export const getArtistBySlugParamsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/i, "Invalid slug format"),
});

export const getArtistBySlugQuerySchema = z.object({
  lang: z.enum(SUPPORTED_LANGS).optional(),
});

export type ListArtistsQuery = z.infer<typeof listArtistsQuerySchema>;
export type GetArtistBySlugParams = z.infer<typeof getArtistBySlugParamsSchema>;
export type GetArtistBySlugQuery = z.infer<typeof getArtistBySlugQuerySchema>;

export const ARTIST_LIST_DEFAULTS = {
  PAGE_SIZE: DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} as const;
