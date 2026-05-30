import {
  API_ROUTES,
  buildAdminArtistDetailUrl,
  buildAdminArtistEngagementContractDownloadUrl,
  buildAdminArtistEngagementContractResetUrl,
  buildAdminArtistInvitationResendUrl,
  buildAdminArtistInvitationRevokeUrl,
  buildAdminBookingApproveUrl,
  buildAdminBookingDetailUrl,
  buildAdminBookingMarkCompletedUrl,
  buildAdminBookingMarkDepositPaidUrl,
  buildAdminBookingRejectUrl,
  buildAdminClientInviteUrl,
  buildAdminContentBlockUrl,
} from "@/config/apiRoutes";
import { useAdminAuthStore } from "@/stores/AdminAuthStore";
import { adminFetch } from "@/Utils/Services/Authenticated/adminFetch";
import { publicFetch } from "@/Utils/Services/Public/publicFetch";

export interface AdminLoginResponse {
  token: string;
  refreshToken: string;
  expiresInSeconds: number;
  refreshExpiresInSeconds: number;
  admin: { id: string; email: string; fullName: string };
}

export type ArtistLevel = "L1" | "L2" | "L3" | "L4";
export type ArtistSetType = "dj" | "hybrid" | "live";
export type ArtistInvitationStatus =
  | "pending"
  | "accepted"
  | "expired"
  | "revoked";
export type ArtistInvitationLocale = "fr" | "nl" | "en";

export interface AdminArtistRow {
  id: string;
  slug: string;
  stage_name: string;
  genre: string | null;
  is_published: boolean;
  is_featured: boolean;
  cover_image_url: string | null;
  level: ArtistLevel;
}

export interface AdminBookingRow {
  id: string;
  artist_id: string;
  artist_stage_name: string;
  client_email: string | null;
  client_name: string | null;
  event_date: string;
  event_duration_hours: number;
  event_location_address: string;
  quoted_total_cents: number;
  deposit_amount_cents: number;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export interface AdminContentBlock {
  key: string;
  value_fr: string | null;
  value_nl: string | null;
  value_en: string | null;
  updated_at: string;
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<AdminLoginResponse | null> {
  return publicFetch<AdminLoginResponse>(API_ROUTES.adminAuthLogin, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    silent: true,
  });
}

export async function logoutAdmin(refreshToken: string | null): Promise<void> {
  if (!refreshToken) return;
  await fetch(API_ROUTES.adminAuthLogout, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}

export interface AdminArtistDetail {
  id: string;
  slug: string;
  stage_name: string;
  bio_fr: string | null;
  bio_nl: string | null;
  bio_en: string | null;
  genre: string | null;
  is_published: boolean;
  is_featured: boolean;
  cover_image_url: string | null;
  level: ArtistLevel;
}

export async function fetchAdminArtists(
  q?: string,
  pageSize?: number,
): Promise<{ data: AdminArtistRow[]; pagination: { total: number } } | null> {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (pageSize !== undefined) params.set("page_size", String(pageSize));
  const qs = params.toString();
  return adminFetch(`${API_ROUTES.adminArtists}${qs ? `?${qs}` : ""}`);
}

export async function fetchAdminArtistDetail(
  id: string,
): Promise<AdminArtistDetail | null> {
  return adminFetch(buildAdminArtistDetailUrl(id));
}

export async function postAdminArtist(
  payload: Record<string, unknown>,
): Promise<AdminArtistRow | null> {
  return adminFetch(API_ROUTES.adminArtists, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function putAdminArtist(
  id: string,
  payload: Record<string, unknown>,
): Promise<AdminArtistRow | null> {
  return adminFetch(buildAdminArtistDetailUrl(id), {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminArtist(id: string): Promise<unknown> {
  return adminFetch(buildAdminArtistDetailUrl(id), { method: "DELETE" });
}

export async function resetAdminArtistEngagementContract(
  id: string,
): Promise<{ ok: boolean; deleted: number } | null> {
  return adminFetch(buildAdminArtistEngagementContractResetUrl(id), {
    method: "POST",
    body: JSON.stringify({}),
  });
}

// Streams the engagement-contract PDF (signed if available, freshly-rendered
// draft otherwise) and triggers a browser download. The endpoint is admin
// auth-protected, so we fetch with the JWT and pipe the blob through an
// object URL rather than `window.open`-ing it directly.
export async function downloadAdminArtistEngagementContract(
  id: string,
  filename = "engagement-contract.pdf",
): Promise<boolean> {
  const { useAdminAuthStore } = await import("@/stores/AdminAuthStore");
  const token = useAdminAuthStore.getState().token;
  if (!token) return false;
  const response = await fetch(
    buildAdminArtistEngagementContractDownloadUrl(id),
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) return false;
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return true;
}

// --- Artist invitations (magic link onboarding) ---

export interface AdminArtistInvitation {
  id: string;
  email: string;
  stageName: string;
  level: ArtistLevel;
  setType: ArtistSetType;
  customMessage: string | null;
  status: ArtistInvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  artistId: string | null;
  lastResentAt: string | null;
  resendCount: number;
  createdAt: string;
}

export interface AdminArtistInvitationCreateResult {
  invitation: AdminArtistInvitation;
  invitationUrl: string;
}

export interface AdminArtistInvitationCreatePayload {
  email: string;
  stageName: string;
  level: ArtistLevel;
  setType: ArtistSetType;
  customMessage?: string;
  locale?: ArtistInvitationLocale;
}

export async function postAdminArtistInvitation(
  payload: AdminArtistInvitationCreatePayload,
): Promise<AdminArtistInvitationCreateResult | null> {
  return adminFetch(API_ROUTES.adminArtistInvitations, {
    method: "POST",
    body: JSON.stringify({ locale: "fr", ...payload }),
  });
}

export async function fetchAdminArtistInvitations(
  filters: {
    status?: ArtistInvitationStatus;
    q?: string;
    pageSize?: number;
  } = {},
): Promise<{
  data: AdminArtistInvitation[];
  pagination: { page: number; pageSize: number; total: number };
} | null> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.q) params.set("q", filters.q);
  if (filters.pageSize !== undefined)
    params.set("page_size", String(filters.pageSize));
  const qs = params.toString();
  return adminFetch(
    `${API_ROUTES.adminArtistInvitations}${qs ? `?${qs}` : ""}`,
  );
}

export async function resendAdminArtistInvitation(
  id: string,
  options: {
    locale?: ArtistInvitationLocale;
    skipEmail?: boolean;
  } = {},
): Promise<AdminArtistInvitationCreateResult | null> {
  const { locale = "fr", skipEmail = false } = options;
  return adminFetch(buildAdminArtistInvitationResendUrl(id), {
    method: "POST",
    body: JSON.stringify({ locale, skipEmail }),
  });
}

export async function revokeAdminArtistInvitation(
  id: string,
): Promise<AdminArtistInvitation | null> {
  return adminFetch(buildAdminArtistInvitationRevokeUrl(id), {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function fetchAdminBookings(
  filters: { status?: string; artistId?: string } = {},
): Promise<{ data: AdminBookingRow[]; pagination: { total: number } } | null> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.artistId) params.set("artist_id", filters.artistId);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return adminFetch(`${API_ROUTES.adminBookings}${qs}`);
}

export interface AdminBookingDetail {
  id: string;
  status: string;
  artistId: string;
  artistSlug: string;
  artistStageName: string;
  eventDate: string;
  eventDurationHours: number;
  eventLocation: string;
  eventLocationLat: number | null;
  eventLocationLng: number | null;
  eventContext: string | null;
  options: unknown;
  quotedTotalCents: number;
  depositAmountCents: number;
  client: {
    name: string | null;
    email: string | null;
    phone: string | null;
    locale: string;
    accountId: string | null;
    accountEmail: string | null;
    claimedAt: string | null;
  };
  adminApprovedAt: string | null;
  paidAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchAdminBookingDetail(
  bookingId: string,
): Promise<AdminBookingDetail | null> {
  return adminFetch<AdminBookingDetail>(buildAdminBookingDetailUrl(bookingId));
}

export async function inviteClientAccount(
  clientId: string,
  locale: "fr" | "nl" | "en",
): Promise<{ message: string } | null> {
  return adminFetch(buildAdminClientInviteUrl(clientId), {
    method: "POST",
    body: JSON.stringify({ locale }),
  });
}

export async function approveAdminBooking(bookingId: string): Promise<unknown> {
  return adminFetch(buildAdminBookingApproveUrl(bookingId), {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function rejectAdminBooking(
  bookingId: string,
  reason: string,
): Promise<unknown> {
  return adminFetch(buildAdminBookingRejectUrl(bookingId), {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// Admin manually records that the client paid the deposit off-platform.
// Transitions `awaiting_deposit` -> `confirmed`.
export async function markAdminBookingDepositPaid(
  bookingId: string,
): Promise<unknown> {
  return adminFetch(buildAdminBookingMarkDepositPaidUrl(bookingId), {
    method: "POST",
    body: JSON.stringify({}),
  });
}

// Admin closes the booking after the event + balance received.
// Transitions `confirmed` -> `completed`.
export async function markAdminBookingCompleted(
  bookingId: string,
): Promise<unknown> {
  return adminFetch(buildAdminBookingMarkCompletedUrl(bookingId), {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export interface AdminBookingCreatePayload {
  artistId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  eventDate: string;
  eventDurationHours: number;
  eventLocation: string;
  capacity: number;
  ticketPriceCents: number;
  setType: ArtistSetType;
  quotedTotalCents?: number;
  depositAmountCents?: number;
  initialStatus: string;
  skipEmails: boolean;
  overrideConflict: boolean;
  internalNote?: string;
}

export async function createAdminBooking(
  payload: AdminBookingCreatePayload,
): Promise<{ id: string } | null> {
  return adminFetch(API_ROUTES.adminBookings, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface AdminBookingUpdatePayload {
  eventDate?: string;
  eventDurationHours?: number;
  eventLocationAddress?: string;
  eventContext?: string | null;
  quotedTotalCents?: number;
  depositAmountCents?: number;
}

export async function updateAdminBooking(
  bookingId: string,
  payload: AdminBookingUpdatePayload,
): Promise<{ id: string; status: string; updated_at: string } | null> {
  return adminFetch(buildAdminBookingDetailUrl(bookingId), {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminContent(): Promise<{
  data: AdminContentBlock[];
} | null> {
  return adminFetch(API_ROUTES.adminContent);
}

export async function putAdminContent(
  key: string,
  payload: { valueFr?: string; valueNl?: string; valueEn?: string },
): Promise<unknown> {
  return adminFetch(buildAdminContentBlockUrl(key), {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export interface AdminAgencySignature {
  signature_image_data_url: string | null;
  has_signature: boolean;
}

export async function fetchAdminAgencySignature(): Promise<AdminAgencySignature | null> {
  return adminFetch<AdminAgencySignature>(API_ROUTES.adminAgencySignature);
}

// PUT /agency/signature expects multipart/form-data so we hit fetch directly
// (adminFetch sets `Content-Type: application/json` which breaks multipart).
export async function uploadAdminAgencySignature(
  pngBlob: Blob,
): Promise<AdminAgencySignature | null> {
  const token = useAdminAuthStore.getState().token;
  if (!token) return null;
  const fd = new FormData();
  fd.append("signature", pngBlob, "agency-signature.png");
  const response = await fetch(API_ROUTES.adminAgencySignature, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!response.ok) return null;
  return (await response.json()) as AdminAgencySignature;
}

export async function deleteAdminAgencySignature(): Promise<AdminAgencySignature | null> {
  return adminFetch<AdminAgencySignature>(API_ROUTES.adminAgencySignature, {
    method: "DELETE",
  });
}

export interface AdminAgencyInfo {
  name: string | null;
  representative: string | null;
  address: string | null;
  city: string | null;
  companyNumber: string | null;
  vatNumber: string | null;
  email: string | null;
  iban: string | null;
}

export async function fetchAdminAgencyInfo(): Promise<AdminAgencyInfo | null> {
  return adminFetch<AdminAgencyInfo>(API_ROUTES.adminAgencyInfo);
}

export async function putAdminAgencyInfo(
  info: AdminAgencyInfo,
): Promise<AdminAgencyInfo | null> {
  return adminFetch<AdminAgencyInfo>(API_ROUTES.adminAgencyInfo, {
    method: "PUT",
    body: JSON.stringify(info),
  });
}
