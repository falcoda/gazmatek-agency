import { passwordSchema } from "@src/helpers/auth/passwordPolicy";
import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.email(),
  password: passwordSchema(),
});

export const forgotPasswordBodySchema = z.object({
  email: z.email(),
  locale: z.enum(["fr", "nl", "en"]).default("fr"),
});

export const resetPasswordBodySchema = z.object({
  token: z.string().min(32).max(128),
  newPassword: passwordSchema(),
});

export const unavailabilityIdParamsSchema = z.object({
  id: z.guid(),
});
