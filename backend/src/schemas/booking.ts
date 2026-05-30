import { ArtistSetType } from "@src/helpers/constants/artist";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from "@src/helpers/constants/domain";
import { z } from "zod";

const MAX_CONTEXT_LEN = 2000;

export const createBookingBodySchema = z
  .object({
    artistId: z.guid().optional(),
    artistSlug: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(
        /^[a-z0-9-]+$/,
        "Slug must be lowercase letters, digits and dashes",
      )
      .optional(),
    eventDate: z.iso.datetime({ offset: true }),
    durationHours: z.number().positive().min(0.5).max(24),
    location: z.object({
      address: z.string().trim().min(2).max(500),
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    }),
    context: z.string().trim().max(MAX_CONTEXT_LEN).optional(),
    capacity: z.number().int().nonnegative().max(1_000_000),
    ticketPriceCents: z.number().int().nonnegative().max(1_000_000_00),
    setType: z.enum(ArtistSetType),
    options: z
      .array(
        z.object({
          id: z.string().trim().min(1).max(64),
          label: z.string().trim().max(120).optional(),
          priceCents: z.number().int().nonnegative().optional(),
        }),
      )
      .max(20)
      .default([]),
    locale: z.enum(SUPPORTED_LOCALES).default(DEFAULT_LOCALE),
  })
  .refine((data) => Boolean(data.artistId) || Boolean(data.artistSlug), {
    message: "Either artistId or artistSlug must be provided",
    path: ["artistSlug"],
  });

export type CreateBookingBody = z.infer<typeof createBookingBodySchema>;
