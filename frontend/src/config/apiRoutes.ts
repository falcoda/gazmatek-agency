/**
 * Centralized list of API routes consumed by the frontend.
 * Any new endpoint MUST be referenced here — no hardcoded `/api/...` literals
 * in component or page code.
 */
export const API_ROUTES = {
  // Public — artists
  artistsList: "/api/artists",
  artistDetail: "/api/artists/:slug",
  artistAvailability: "/api/artists/:id/availability",

  // Public — pricing
  pricingEstimate: "/api/pricing/estimate",
  pricingArtistFee: "/api/pricing/artist-fee",

  // Public — contact
  contact: "/api/contact",

  // Public — bookings
  bookingsCreate: "/api/bookings",

  // Client account (magic link auth)
  accountRegister: "/api/account/register",
  accountLogin: "/api/account/login",
  accountRefresh: "/api/account/refresh",
  accountForgotPassword: "/api/account/forgot-password",
  accountResetPassword: "/api/account/reset-password",
  accountBookings: "/api/account/bookings",
  accountBookingDetail: "/api/account/bookings/:id",
  accountBookingCancel: "/api/account/bookings/:id/cancel",
  accountLogout: "/api/account/logout",
  accountMe: "/api/account/me",

  // Artist
  artistAuthLogin: "/api/artist/auth/login",
  artistAuthRefresh: "/api/artist/auth/refresh",
  artistAuthLogout: "/api/artist/auth/logout",
  artistAuthForgotPassword: "/api/artist/auth/forgot-password",
  artistAuthResetPassword: "/api/artist/auth/reset-password",
  artistMe: "/api/artist/me",
  artistProfile: "/api/artist/profile",
  artistProfilePassword: "/api/artist/profile/password",
  artistProfileCoverImage: "/api/artist/profile/cover-image",
  artistProfilePhotos: "/api/artist/profile/photos",
  artistProfilePhotoDetail: "/api/artist/profile/photos/:id",
  artistBookings: "/api/artist/bookings",
  artistBookingDetail: "/api/artist/bookings/:id",
  artistBookingContract: "/api/artist/bookings/:id/contract",
  artistUnavailabilities: "/api/artist/unavailabilities",
  artistUnavailabilityDetail: "/api/artist/unavailabilities/:id",
  artistInvitationLanding: "/api/artist/invitations/:token",
  artistInvitationAccept: "/api/artist/invitations/:token/accept",
  artistOnboardingEngagement: "/api/artist/onboarding/engagement",
  artistOnboardingEngagementSign: "/api/artist/onboarding/engagement/sign",
  artistEngagementContractSigned: "/api/artist/contracts/engagement/signed",

  // Admin — auth
  adminAuthLogin: "/api/admin/auth/login",
  adminAuthRefresh: "/api/admin/auth/refresh",
  adminAuthLogout: "/api/admin/auth/logout",
  adminAuthMe: "/api/admin/auth/me",

  // Admin — agency settings
  adminAgencySignature: "/api/admin/agency/signature",
  adminAgencyInfo: "/api/admin/agency/info",

  // Admin — resources
  adminArtists: "/api/admin/artists",
  adminArtistDetail: "/api/admin/artists/:id",
  adminArtistPhotos: "/api/admin/artists/:id/photos",
  adminArtistPhotoDetail: "/api/admin/artists/:id/photos/:photoId",
  adminArtistCoverImage: "/api/admin/artists/:id/cover-image",
  adminArtistEngagementContractReset:
    "/api/admin/artists/:id/engagement-contract/reset",
  adminArtistEngagementContractDownload:
    "/api/admin/artists/:id/engagement-contract/download",
  adminArtistInvitations: "/api/admin/artist-invitations",
  adminArtistInvitationResend: "/api/admin/artist-invitations/:id/resend",
  adminArtistInvitationRevoke: "/api/admin/artist-invitations/:id/revoke",
  adminArtistUnavailabilities: "/api/admin/artists/:id/unavailabilities",
  adminClientInvite: "/api/admin/clients/:id/invite",
  adminBookings: "/api/admin/bookings",
  adminBookingDetail: "/api/admin/bookings/:id",
  adminBookingApprove: "/api/admin/bookings/:id/approve",
  adminBookingReject: "/api/admin/bookings/:id/reject",
  adminBookingMarkDepositPaid: "/api/admin/bookings/:id/mark-deposit-paid",
  adminBookingMarkCompleted: "/api/admin/bookings/:id/mark-completed",
  adminBookingContract: "/api/admin/bookings/:id/contract",
  adminContractRemind: "/api/admin/contracts/:id/remind",
  adminCalendar: "/api/admin/calendar",
  adminContent: "/api/admin/content",
  adminContentBlock: "/api/admin/content/:key",

  // Public — stats
  statsHome: "/api/stats/home",

  // Public — pricing grid
  pricingGrid: "/api/pricing/grid",

  // Main user auth (shared session)
  authRefresh: "/api/auth/refresh",
} as const;

export type ApiRouteKey = keyof typeof API_ROUTES;

/**
 * Replace `:param` placeholders in a route template with URL-encoded values.
 * Use this for any route that contains a dynamic segment.
 */
export function replaceApiParams<T extends string>(
  template: T,
  params: Record<string, string>,
): string {
  let out: string = template;
  for (const [k, v] of Object.entries(params)) {
    out = out.replace(`:${k}`, encodeURIComponent(v));
  }
  return out;
}

export const buildArtistDetailUrl = (slug: string): string =>
  replaceApiParams(API_ROUTES.artistDetail, { slug });

export const buildArtistAvailabilityUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.artistAvailability, { id });

export const buildAccountBookingDetailUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.accountBookingDetail, { id });

export const buildArtistInvitationUrl = (token: string): string =>
  replaceApiParams(API_ROUTES.artistInvitationLanding, { token });

export const buildArtistInvitationAcceptUrl = (token: string): string =>
  replaceApiParams(API_ROUTES.artistInvitationAccept, { token });

export const buildAdminArtistDetailUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.adminArtistDetail, { id });

export const buildAdminArtistCoverImageUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.adminArtistCoverImage, { id });

export const buildAdminBookingApproveUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.adminBookingApprove, { id });

export const buildAdminBookingRejectUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.adminBookingReject, { id });

export const buildAdminBookingContractUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.adminBookingContract, { id });

export const buildAdminContractRemindUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.adminContractRemind, { id });

export const buildAdminContentBlockUrl = (key: string): string =>
  replaceApiParams(API_ROUTES.adminContentBlock, { key });

export const buildArtistUnavailabilityDetailUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.artistUnavailabilityDetail, { id });

export const buildArtistBookingDetailUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.artistBookingDetail, { id });

export const buildAdminBookingDetailUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.adminBookingDetail, { id });

export const buildAdminBookingMarkDepositPaidUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.adminBookingMarkDepositPaid, { id });

export const buildAdminBookingMarkCompletedUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.adminBookingMarkCompleted, { id });

export const buildAdminArtistEngagementContractResetUrl = (
  id: string,
): string =>
  replaceApiParams(API_ROUTES.adminArtistEngagementContractReset, { id });

export const buildAdminArtistEngagementContractDownloadUrl = (
  id: string,
): string =>
  replaceApiParams(API_ROUTES.adminArtistEngagementContractDownload, { id });

export const buildAdminArtistInvitationResendUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.adminArtistInvitationResend, { id });

export const buildAdminArtistInvitationRevokeUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.adminArtistInvitationRevoke, { id });

export const buildAdminClientInviteUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.adminClientInvite, { id });

export const buildAccountBookingCancelUrl = (id: string): string =>
  replaceApiParams(API_ROUTES.accountBookingCancel, { id });
