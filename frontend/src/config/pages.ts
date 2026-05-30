import type { AppLanguage } from "../i18n/config";
import { buildLocalizedPath } from "../i18n/routing";
import { I18N_ROUTING } from "./site";

export const PAGES = {
  main: "/",
  artists: "/artists",
  artistDetail: "/artists/:slug",
  pricing: "/pricing",
  contact: "/contact",
  bookingNew: "/booking/new",
  bookingSent: "/booking/sent",
  terms: "/terms",
  privacy: "/privacy",
  artistLogin: "/artist/login",
  artistForgotPassword: "/artist/forgot-password",
  artistResetPassword: "/artist/reset-password",
  artistBookings: "/artist/bookings",
  artistBookingDetail: "/artist/bookings/:id",
  artistCalendar: "/artist/calendar",
  adminLogin: "/admin/login",
  adminArtists: "/admin/artists",
  adminArtistEdit: "/admin/artists/:id",
  adminBookings: "/admin/bookings",
  adminBookingNew: "/admin/bookings/new",
  adminBookingDetail: "/admin/bookings/:id",
  adminContent: "/admin/content",
  adminSettings: "/admin/settings",
  accountLogin: "/account/login",
  accountSignup: "/account/signup",
  accountForgotPassword: "/account/forgot-password",
  accountResetPassword: "/account/reset-password",
  accountClaim: "/account/claim",
  accountDashboard: "/account",
  artistProfile: "/artist/profile",
  artistInvitation: "/artist/invitation",
  artistOnboardingContract: "/artist/onboarding/contract",
  login: "/login",
} as const;

export type PageKey = keyof typeof PAGES;

export const PRICING_QUERY_PARAM = "artiste" as const;

export function getPagePath(page: PageKey, language?: AppLanguage): string {
  const pagePath = PAGES[page];

  if (I18N_ROUTING && language) {
    return buildLocalizedPath(language, pagePath);
  }

  return pagePath;
}

export function buildArtistDetailPath(
  slug: string,
  language?: AppLanguage,
): string {
  const path = `/artists/${slug}`;
  if (I18N_ROUTING && language) {
    return buildLocalizedPath(language, path);
  }
  return path;
}

export function buildAdminBookingDetailPath(
  bookingId: string,
  language?: AppLanguage,
): string {
  const path = `/admin/bookings/${bookingId}`;
  if (I18N_ROUTING && language) {
    return buildLocalizedPath(language, path);
  }
  return path;
}

export interface BookingPrefill {
  artistSlug?: string;
  durationHours?: number;
  date?: string;
  location?: string;
  capacity?: number;
  ticketPriceCents?: number;
  setType?: "dj" | "hybrid" | "live";
  options?: string[];
}

export const BOOKING_QUERY_PARAM = "artist" as const;

export function buildBookingUrl(
  prefill: BookingPrefill = {},
  language?: AppLanguage,
): string {
  const params = new URLSearchParams();

  if (prefill.artistSlug) {
    params.set(BOOKING_QUERY_PARAM, prefill.artistSlug);
  }
  if (prefill.durationHours !== undefined) {
    params.set("duration", String(prefill.durationHours));
  }
  if (prefill.date) {
    params.set("date", prefill.date);
  }
  if (prefill.location) {
    params.set("location", prefill.location);
  }
  if (prefill.capacity !== undefined) {
    params.set("capacity", String(prefill.capacity));
  }
  if (prefill.ticketPriceCents !== undefined) {
    params.set("ticketPrice", String(prefill.ticketPriceCents));
  }
  if (prefill.setType) {
    params.set("setType", prefill.setType);
  }
  if (prefill.options && prefill.options.length > 0) {
    params.set("options", prefill.options.join(","));
  }

  const qs = params.toString();
  const basePath = PAGES.bookingNew;
  const localized =
    I18N_ROUTING && language
      ? buildLocalizedPath(language, basePath)
      : basePath;

  return qs ? `${localized}?${qs}` : localized;
}
