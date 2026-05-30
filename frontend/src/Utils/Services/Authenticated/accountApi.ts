import { API_ROUTES, buildAccountBookingCancelUrl } from "@/config/apiRoutes";
import type { ClientIdentity } from "@/stores/ClientAuthStore";
import { clientFetch } from "@/Utils/Services/Authenticated/clientFetch";
import { publicFetch } from "@/Utils/Services/Public/publicFetch";

export interface ClientAuthResponse {
  token: string;
  refreshToken: string;
  expiresInSeconds: number;
  refreshExpiresInSeconds: number;
  client: ClientIdentity;
}

export interface AccountBookingDto {
  id: string;
  status: string;
  eventDate: string;
  eventDurationHours: number;
  eventLocationAddress: string;
  eventContext: string | null;
  quotedTotalCents: number;
  createdAt: string;
  artist: {
    id: string;
    slug: string;
    stageName: string;
    coverImageUrl: string | null;
  };
}

export interface RegisterAccountPayload {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  companyName?: string;
  companyNumber?: string;
  vatNumber?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressZip?: string;
  addressCity?: string;
  addressCountry?: string;
}

export async function registerAccount(
  payload: RegisterAccountPayload,
): Promise<ClientAuthResponse | null> {
  return publicFetch<ClientAuthResponse>(API_ROUTES.accountRegister, {
    method: "POST",
    body: JSON.stringify(payload),
    silent: true,
  });
}

export async function loginAccount(
  email: string,
  password: string,
): Promise<ClientAuthResponse | null> {
  return publicFetch<ClientAuthResponse>(API_ROUTES.accountLogin, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    silent: true,
  });
}

export async function logoutAccount(
  refreshToken: string | null,
): Promise<void> {
  if (!refreshToken) return;
  await fetch(API_ROUTES.accountLogout, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function forgotAccountPassword(
  email: string,
  locale: "fr" | "nl" | "en",
): Promise<{ message: string } | null> {
  return publicFetch(API_ROUTES.accountForgotPassword, {
    method: "POST",
    body: JSON.stringify({ email, locale }),
  });
}

export async function resetAccountPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string; email: string | null } | null> {
  return publicFetch(API_ROUTES.accountResetPassword, {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function fetchAccountBookings(): Promise<{
  bookings: AccountBookingDto[];
} | null> {
  return clientFetch(API_ROUTES.accountBookings);
}

export interface CancelAccountBookingResponse {
  id: string;
  status: string;
  cancelReason: string;
}

export async function cancelAccountBooking(
  bookingId: string,
  reason?: string,
): Promise<CancelAccountBookingResponse | null> {
  return clientFetch<CancelAccountBookingResponse>(
    buildAccountBookingCancelUrl(bookingId),
    {
      method: "POST",
      body: JSON.stringify(reason ? { reason } : {}),
    },
  );
}
