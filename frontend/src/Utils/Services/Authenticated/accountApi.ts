import {
  API_ROUTES,
  buildAccountBookingCancelUrl,
  buildAccountBookingDetailUrl,
} from "@/config/apiRoutes";
import type { ClientIdentity } from "@/stores/ClientAuthStore";
import { loggerService, LogTag } from "@/Utils/LoggerService";
import { clientFetch } from "@/Utils/Services/Authenticated/clientFetch";
import {
  publicFetch,
  publicFetchOk,
} from "@/Utils/Services/Public/publicFetch";

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
  // Route through the standard wrapper. If the revoke fails we still clear
  // locally; surface a warning for observability. (#47)
  const ok = await publicFetchOk(API_ROUTES.accountLogout, {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  if (!ok) {
    loggerService.warn(
      LogTag.AUTH,
      "logoutAccount: server-side token revocation failed",
    );
  }
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

// All fields optional: the backend COALESCEs absent fields, so we only send
// what the client edited. (#30)
export interface UpdateAccountBookingPayload {
  eventDate?: string;
  durationHours?: number;
  location?: { address: string; lat?: number; lng?: number };
  context?: string | null;
  capacity?: number;
  ticketPriceCents?: number;
}

export interface UpdateAccountBookingResponse {
  id: string;
  status: string;
}

// Client edits an own booking. Allowed by the backend only while the booking is
// in `pending_validation`. (#30)
export async function updateAccountBooking(
  bookingId: string,
  payload: UpdateAccountBookingPayload,
): Promise<UpdateAccountBookingResponse | null> {
  return clientFetch<UpdateAccountBookingResponse>(
    buildAccountBookingDetailUrl(bookingId),
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
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
