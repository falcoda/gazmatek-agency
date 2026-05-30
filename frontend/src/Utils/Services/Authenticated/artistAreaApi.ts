import {
  API_ROUTES,
  buildArtistUnavailabilityDetailUrl,
} from "@/config/apiRoutes";
import { artistFetch } from "@/Utils/Services/Authenticated/artistFetch";
import { publicFetch } from "@/Utils/Services/Public/publicFetch";

export interface ArtistLoginResponse {
  token: string;
  refreshToken: string;
  expiresInSeconds: number;
  refreshExpiresInSeconds: number;
  artist: { id: string; email: string; slug: string; stageName: string };
}

export interface ArtistBookingDto {
  id: string;
  clientName: string;
  eventDate: string;
  eventDurationHours: number;
  eventLocation: string;
  quotedTotalCents: number;
  depositAmountCents: number;
  status: string;
  paidAt: string | null;
}

export interface ArtistUnavailabilityDto {
  id: string;
  artistId: string;
  startsAt: string;
  endsAt: string;
  source: "personal" | "external_gig";
  externalEventTitle: string | null;
  notes: string | null;
}

export async function loginArtist(
  email: string,
  password: string,
): Promise<ArtistLoginResponse | null> {
  return publicFetch<ArtistLoginResponse>(API_ROUTES.artistAuthLogin, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    silent: true,
  });
}

export async function logoutArtist(refreshToken: string | null): Promise<void> {
  if (!refreshToken) return;
  await fetch(API_ROUTES.artistAuthLogout, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function forgotArtistPassword(
  email: string,
  locale: "fr" | "nl" | "en",
): Promise<{ message: string } | null> {
  return publicFetch(API_ROUTES.artistAuthForgotPassword, {
    method: "POST",
    body: JSON.stringify({ email, locale }),
  });
}

export async function resetArtistPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string } | null> {
  return publicFetch(API_ROUTES.artistAuthResetPassword, {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function fetchArtistBookings(
  tab: "upcoming" | "past",
): Promise<{ data: ArtistBookingDto[] } | null> {
  return artistFetch(`${API_ROUTES.artistBookings}?tab=${tab}`);
}

export async function fetchArtistUnavailabilities(
  from: string,
  to: string,
): Promise<{ data: ArtistUnavailabilityDto[] } | null> {
  const qs = new URLSearchParams({ from, to }).toString();
  return artistFetch(`${API_ROUTES.artistUnavailabilities}?${qs}`);
}

export async function createArtistUnavailability(payload: {
  startsAt: string;
  endsAt: string;
  source: "personal" | "external_gig";
  externalEventTitle?: string;
  externalEventLocation?: string;
  notes?: string;
}): Promise<ArtistUnavailabilityDto | null> {
  return artistFetch(API_ROUTES.artistUnavailabilities, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteArtistUnavailability(id: string): Promise<unknown> {
  return artistFetch(buildArtistUnavailabilityDetailUrl(id), {
    method: "DELETE",
  });
}

export interface ArtistProfileDto {
  id: string;
  slug: string;
  stage_name: string;
  bio_fr: string | null;
  bio_nl: string | null;
  bio_en: string | null;
  technical_info_fr: string | null;
  technical_info_nl: string | null;
  technical_info_en: string | null;
  social_links: Record<string, string> | null;
  cover_image_url: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  vat_number: string | null;
  company_number: string | null;
}

export async function changeArtistPassword(
  currentPassword: string,
  newPassword: string,
): Promise<boolean> {
  const { useArtistAuthStore } = await import("@/stores/ArtistAuthStore");
  const token = useArtistAuthStore.getState().token;
  if (!token) return false;
  const response = await fetch(API_ROUTES.artistProfilePassword, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return response.ok;
}

export async function fetchArtistProfile(): Promise<ArtistProfileDto | null> {
  return artistFetch(API_ROUTES.artistProfile);
}

export async function patchArtistProfile(
  payload: Record<string, unknown>,
): Promise<ArtistProfileDto | null> {
  return artistFetch(API_ROUTES.artistProfile, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export interface EngagementContractDto {
  status: "draft" | "pending_signature" | "signed";
  pdfUrl: string | null;
  signedPdfUrl: string | null;
  signedAt: string | null;
}

export interface EngagementSignResponseDto {
  id: string;
  status: "draft" | "pending_signature" | "signed";
  signingUrl: string | null;
  signedAt: string | null;
}

export async function fetchArtistEngagementContract(): Promise<EngagementContractDto | null> {
  return artistFetch(API_ROUTES.artistOnboardingEngagement);
}

export async function signArtistEngagementContract(): Promise<EngagementSignResponseDto | null> {
  return artistFetch(API_ROUTES.artistOnboardingEngagementSign, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function uploadArtistCoverImage(
  file: File,
): Promise<{ url: string; profile: ArtistProfileDto } | null> {
  const { useArtistAuthStore } = await import("@/stores/ArtistAuthStore");
  const token = useArtistAuthStore.getState().token;
  if (!token) return null;
  const fd = new FormData();
  fd.append("file", file);
  const response = await fetch(API_ROUTES.artistProfileCoverImage, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!response.ok) return null;
  return (await response.json()) as { url: string; profile: ArtistProfileDto };
}
