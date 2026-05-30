// Centralized domain unions & constants (Rule 4: no magic strings).
//
// Reuse-first policy:
// - Booking status lives in @src/services/bookings/bookingConstants and is
//   re-exported here so consumers can import every domain union from one place.
// - Identity kind reuses the existing `UserKind` enum from
//   @src/helpers/auth/identity (admin/artist/client) instead of introducing a
//   second, competing source of truth.

import { UserKind } from "@src/helpers/auth/identity";

export {
  BOOKING_STATUS,
  type BookingStatus,
} from "@src/services/bookings/bookingConstants";

// Contracts ------------------------------------------------------------------
// Only `engagement` contracts are created today (see
// src/db/query/contract/insertEngagementContract.sql). `booking` contracts use
// the same table without a typed kind column value, so the union is kept open
// to the values actually written.
export const CONTRACT_KIND = { ENGAGEMENT: "engagement" } as const;
export type ContractKind = (typeof CONTRACT_KIND)[keyof typeof CONTRACT_KIND];

// Mirrors the pgtyped-generated `contract_status` union found across
// src/db/query/contract/*.types.ts.
export const CONTRACT_STATUS = {
  DRAFT: "draft",
  PENDING_SIGNATURE: "pending_signature",
  SIGNED: "signed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;
export type ContractStatus =
  (typeof CONTRACT_STATUS)[keyof typeof CONTRACT_STATUS];

// Identity -------------------------------------------------------------------
// Re-export the canonical enum rather than declaring a parallel union.
export { UserKind };
export type IdentityKind = UserKind;
export const IDENTITY_KIND = {
  ADMIN: UserKind.ADMIN,
  ARTIST: UserKind.ARTIST,
  CLIENT: UserKind.CLIENT,
} as const;

// Audit ----------------------------------------------------------------------
// Actor kinds match the union in src/helpers/audit.ts.
export const AUDIT_ACTOR_KIND = {
  ADMIN: "admin",
  ARTIST: "artist",
  CLIENT: "client",
  SYSTEM: "system",
} as const;
export type AuditActorKind =
  (typeof AUDIT_ACTOR_KIND)[keyof typeof AUDIT_ACTOR_KIND];

// Target kinds collected from every recordAudit(...) call site in
// src/routes/** and src/services/**.
export const AUDIT_TARGET_KIND = {
  ADMIN_USER: "admin_user",
  ARTIST: "artist",
  ARTIST_ACCOUNT: "artist_account",
  ARTIST_INVITATION: "artist_invitation",
  CLIENT_ACCOUNT: "client_account",
  BOOKING: "booking",
  CONTRACT: "contract",
  AGENCY_SETTINGS: "agency_settings",
  UNAVAILABILITY: "unavailability",
  CONTENT_BLOCK: "content_block",
} as const;
export type AuditTargetKind =
  (typeof AUDIT_TARGET_KIND)[keyof typeof AUDIT_TARGET_KIND];

// Actions collected from every recordAudit(...) call site. Keys are the
// dotted action string upper-snake-cased for readability.
export const AUDIT_ACTION = {
  ADMIN_LOGIN: "admin.login",
  ARTIST_LOGIN: "artist.login",
  CLIENT_LOGIN: "client.login",
  CLIENT_CLAIM: "client.claim",
  CLIENT_REGISTER: "client.register",
  CLIENT_INVITE: "client.invite",
  AGENCY_SIGNATURE_UPDATE: "agency.signature.update",
  AGENCY_SIGNATURE_REMOVE: "agency.signature.remove",
  AGENCY_INFO_UPDATE: "agency.info.update",
  ARTIST_CREATE: "artist.create",
  ARTIST_UPDATE: "artist.update",
  ARTIST_DELETE: "artist.delete",
  ARTIST_COVER_UPLOAD: "artist.cover.upload",
  ARTIST_PASSWORD_CHANGE: "artist.password.change",
  ARTIST_PROFILE_UPDATE: "artist.profile.update",
  ARTIST_INVITATION_CREATE: "artist_invitation.create",
  ARTIST_INVITATION_ACCEPT: "artist_invitation.accept",
  ARTIST_INVITATION_REVOKE: "artist_invitation.revoke",
  ARTIST_INVITATION_ROTATE_LINK: "artist_invitation.rotate_link",
  ARTIST_INVITATION_RESEND: "artist_invitation.resend",
  BOOKING_CREATE: "booking.create",
  BOOKING_ADMIN_CREATE: "booking.adminCreate",
  BOOKING_UPDATE: "booking.update",
  BOOKING_APPROVE: "booking.approve",
  BOOKING_REJECT: "booking.reject",
  BOOKING_MARK_DEPOSIT_PAID: "booking.mark_deposit_paid",
  BOOKING_MARK_COMPLETED: "booking.mark_completed",
  BOOKING_CANCEL: "booking.cancel",
  CONTRACT_VIEW: "contract.view",
  CONTRACT_UPLOAD: "contract.upload",
  CONTRACT_REMIND: "contract.remind",
  ENGAGEMENT_CONTRACT_VIEW: "engagement_contract.view",
  ENGAGEMENT_CONTRACT_SIGN: "engagement_contract.sign",
  ENGAGEMENT_CONTRACT_RESET: "engagement_contract.reset",
  ENGAGEMENT_CONTRACT_DOWNLOAD_DRAFT: "engagement_contract.download_draft",
  ENGAGEMENT_CONTRACT_ENVELOPE_CREATED: "engagement_contract.envelope_created",
  UNAVAILABILITY_CREATE: "unavailability.create",
  UNAVAILABILITY_DELETE: "unavailability.delete",
  CONTENT_UPDATE: "content.update",
} as const;
export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];

// Locales --------------------------------------------------------------------
// Matches EmailLocale (src/services/mailer/queueService.ts) and ArtistLanguage
// (src/controllers/artist/types.ts).
export const SUPPORTED_LOCALES = ["fr", "nl", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "fr";
