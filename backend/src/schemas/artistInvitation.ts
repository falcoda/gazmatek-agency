import { passwordSchema } from "@src/helpers/auth/passwordPolicy";
import { ARTIST_LEVELS, ARTIST_SET_TYPES } from "@src/helpers/constants/artist";
import { z } from "zod";

export const createArtistInvitationBodySchema = z.object({
  email: z.email().max(200),
  stageName: z.string().trim().min(2).max(150),
  level: z.enum(ARTIST_LEVELS),
  setType: z.enum(ARTIST_SET_TYPES),
  customMessage: z.string().trim().max(2000).optional(),
  locale: z.enum(["fr", "nl", "en"]).default("fr"),
});

export const artistInvitationIdParamsSchema = z.object({
  id: z.guid(),
});

export const resendArtistInvitationBodySchema = z.object({
  locale: z.enum(["fr", "nl", "en"]).default("fr"),
  skipEmail: z.boolean().default(false),
});

export const listArtistInvitationsQuerySchema = z.object({
  status: z.enum(["pending", "accepted", "expired", "revoked"]).optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(25),
});

export const artistInvitationTokenParamsSchema = z.object({
  token: z.string().min(20).max(200),
});

export const acceptArtistInvitationBodySchema = z.object({
  password: passwordSchema(),
  cguAccepted: z.boolean(),
  privacyAccepted: z.boolean(),
});
