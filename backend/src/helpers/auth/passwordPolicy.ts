import { z } from "zod";

// Single source of truth for password length constraints. Imported by Zod
// schemas (artistAuth, clientAuth, artistInvitation, …) and by services that
// validate passwords outside of a request schema (e.g. invitation accept).
// Changing these constants here propagates to every flow at once.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const passwordSchema = (): z.ZodString =>
  z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH);

export function isPasswordTooShort(password: string): boolean {
  return password.length < PASSWORD_MIN_LENGTH;
}
