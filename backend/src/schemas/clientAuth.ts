import { passwordSchema } from "@src/helpers/auth/passwordPolicy";
import { z } from "zod";

export const registerBodySchema = z.object({
  email: z.email(),
  password: passwordSchema(),
  displayName: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional(),
  companyName: z.string().trim().max(160).optional(),
  companyNumber: z.string().trim().max(40).optional(),
  vatNumber: z.string().trim().max(40).optional(),
  addressStreet: z.string().trim().max(200).optional(),
  addressNumber: z.string().trim().max(20).optional(),
  addressZip: z.string().trim().max(20).optional(),
  addressCity: z.string().trim().max(120).optional(),
  addressCountry: z.string().trim().max(80).optional(),
});

export const loginBodySchema = z.object({
  email: z.email(),
  password: passwordSchema(),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(32).max(256),
});

export const forgotPasswordBodySchema = z.object({
  email: z.email(),
  locale: z.enum(["fr", "nl", "en"]).default("fr"),
});

export const resetPasswordBodySchema = z.object({
  token: z.string().min(32).max(128),
  newPassword: passwordSchema(),
});

export const accountBookingIdParamsSchema = z.object({
  id: z.guid(),
});

export const accountBookingCancelBodySchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});
