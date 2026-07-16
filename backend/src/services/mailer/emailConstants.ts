import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  SupportedLocale,
} from "@src/helpers/constants/domain";

/**
 * Email queue vocabulary.
 *
 * Lives outside `queueService` so the template layer can depend on these
 * without creating an import cycle with the queue that renders through it.
 */

export enum EmailTemplate {
  BOOKING_CONFIRMATION = "bookingConfirmation",
  BOOKING_APPROVED = "bookingApproved",
  BOOKING_REJECTED = "bookingRejected",
  BOOKING_CONFIRMED = "bookingConfirmed",
  BOOKING_CANCELLED = "bookingCancelled",
  CONTRACT_READY = "contractReady",
  CONTRACT_SIGNED = "contractSigned",
  CONTRACT_REMINDER = "contractReminder",
  PASSWORD_RESET = "passwordReset",
  CONTACT_MESSAGE = "contactMessage",
  CONTACT_ACK = "contactAck",
  CLIENT_INVITATION = "clientInvitation",
  ARTIST_INVITATION = "artistInvitation",
}

// Emails are localized with the app-wide locale set — every template must cover
// each one, so these are aliases rather than a parallel list that could drift.
export type EmailLocale = SupportedLocale;
export const EMAIL_LOCALES = SUPPORTED_LOCALES;
export const DEFAULT_EMAIL_LOCALE = DEFAULT_LOCALE;

export interface EmailPayload {
  [key: string]: unknown;
}
