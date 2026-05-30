import { ARTIST_LEVELS, ARTIST_SET_TYPES } from "@src/helpers/constants/artist";
import { MAX_DURATION_HOURS } from "@src/services/pricing/pricingConstants";
import { z } from "zod";

const MIN_DURATION_HOURS = 0.5;
const MAX_OPTIONS = 20;
const MAX_OPTION_PRICE_CENTS = 1_000_000_00;

const optionSchema = z.object({
  id: z.string().trim().min(1).max(64),
  label: z.string().trim().min(1).max(120),
  priceCents: z.number().int().nonnegative().max(MAX_OPTION_PRICE_CENTS),
});

export const estimateBodySchema = z.object({
  artistId: z.guid(),
  durationHours: z
    .number()
    .positive()
    .min(MIN_DURATION_HOURS)
    .max(MAX_DURATION_HOURS),
  date: z.iso.date(),
  location: z.object({
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    address: z.string().trim().min(1).max(500).optional(),
  }),
  capacity: z.number().int().nonnegative().max(1_000_000),
  ticketPriceCents: z.number().int().nonnegative().max(1_000_000_00),
  setType: z.enum(ARTIST_SET_TYPES),
  options: z.array(optionSchema).max(MAX_OPTIONS).default([]),
});

export const artistFeeBodySchema = z.object({
  capacity: z.number().int().nonnegative().max(1_000_000),
  ticketPrice: z.number().nonnegative().max(10_000),
  level: z.enum(ARTIST_LEVELS),
  setType: z.enum(ARTIST_SET_TYPES),
});

export type EstimateBody = z.infer<typeof estimateBodySchema>;
export type ArtistFeeBody = z.infer<typeof artistFeeBodySchema>;
