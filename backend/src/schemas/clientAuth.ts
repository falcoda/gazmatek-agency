import { passwordSchema } from "@src/helpers/auth/passwordPolicy";
import { MAX_DURATION_HOURS_PUBLIC } from "@src/services/bookings/bookingConstants";
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

// #30 — client edit of a pending_validation booking. Every field is optional;
// at least one must be provided. Mirrors the create schema's bounds.
export const accountBookingEditBodySchema = z
  .object({
    eventDate: z.iso.datetime({ offset: true }).optional(),
    durationHours: z
      .number()
      .positive()
      .min(0.5)
      .max(MAX_DURATION_HOURS_PUBLIC)
      .optional(),
    location: z
      .object({
        address: z.string().trim().min(2).max(500),
        lat: z.number().min(-90).max(90).optional(),
        lng: z.number().min(-180).max(180).optional(),
      })
      .optional(),
    context: z.string().trim().max(2000).nullish(),
    capacity: z.number().int().nonnegative().max(1_000_000).optional(),
    ticketPriceCents: z
      .number()
      .int()
      .nonnegative()
      .max(1_000_000_00)
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type AccountBookingEditBody = z.infer<
  typeof accountBookingEditBodySchema
>;
