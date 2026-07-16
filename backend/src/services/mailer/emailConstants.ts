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

export type EmailLocale = "fr" | "nl" | "en";

export const EMAIL_LOCALES: readonly EmailLocale[] = ["fr", "nl", "en"];

export const DEFAULT_EMAIL_LOCALE: EmailLocale = "fr";

export interface EmailPayload {
  [key: string]: unknown;
}
