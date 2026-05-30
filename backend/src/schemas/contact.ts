import { z } from "zod";

const MIN_MESSAGE_LENGTH = 20;
const MAX_MESSAGE_LENGTH = 5000;

export const sendContactMessageBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(MIN_MESSAGE_LENGTH).max(MAX_MESSAGE_LENGTH),
  // Honeypot: real users leave this empty. We accept any value here so the
  // controller can silently drop bot submissions instead of telling them
  // through a validation error that the field is the trap.
  website: z.string().max(2000).optional().default(""),
});

export type SendContactMessageBody = z.infer<
  typeof sendContactMessageBodySchema
>;
