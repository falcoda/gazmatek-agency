import { API_ROUTES } from "@/config/apiRoutes";
import { BOOKING_ERROR_CODES } from "@/config/errorCodes";
import { HTTP_STATUS } from "@/config/httpStatus";
import { clientFetch } from "@/Utils/Services/Authenticated/clientFetch";
import type { ApiErrorBody } from "@/Utils/Services/Fetch/responseParsing";
import type { ArtistSetType } from "@/Utils/Services/Public/pricingApi";

/** Localizable, field-scoped failure kinds surfaced by {@link createBooking}. */
export type BookingCreateError =
  | { kind: "leadTime"; minLeadTimeHours?: number }
  | { kind: "artistUnavailable" }
  | { kind: "artistNotFound" }
  | { kind: "generic" };

export interface BookingOptionPayload {
  id: string;
  label?: string;
  priceCents?: number;
}

export interface CreateBookingPayload {
  artistId?: string;
  artistSlug?: string;
  eventDate: string;
  durationHours: number;
  location: { address: string; lat?: number; lng?: number };
  context?: string;
  capacity: number;
  ticketPriceCents: number;
  setType: ArtistSetType;
  options: BookingOptionPayload[];
  locale: "fr" | "nl" | "en";
}

export interface CreateBookingResponse {
  id: string;
  status: string;
  clientEmail: string;
}

export async function postCreateBooking(
  body: CreateBookingPayload,
): Promise<CreateBookingResponse | null> {
  return clientFetch<CreateBookingResponse>(API_ROUTES.bookingsCreate, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Extract the typed booking error code from a parsed error body, if any. */
function readBookingErrorCode(body: ApiErrorBody | null): string | undefined {
  const details = body?.details as { code?: string } | undefined;
  return details?.code;
}

function readMinLeadTimeHours(body: ApiErrorBody | null): number | undefined {
  const details = body?.details as { minLeadTimeHours?: number } | undefined;
  return typeof details?.minLeadTimeHours === "number"
    ? details.minLeadTimeHours
    : undefined;
}

/**
 * Booking-creation variant that returns a discriminated result so the form can
 * map typed backend error codes (lead-time / 409 unavailable / 404 not found)
 * to localized field-level messages rather than surfacing the raw English
 * message. (#31)
 */
export async function createBooking(
  body: CreateBookingPayload,
): Promise<
  | { ok: true; data: CreateBookingResponse }
  | { ok: false; error: BookingCreateError }
> {
  let failure: BookingCreateError = { kind: "generic" };
  const data = await clientFetch<CreateBookingResponse>(
    API_ROUTES.bookingsCreate,
    {
      method: "POST",
      body: JSON.stringify(body),
      // Map the error ourselves: suppress the default toast and decide the
      // localized field message in the component.
      silent: true,
      onError: (status, errorBody) => {
        const code = readBookingErrorCode(errorBody);
        if (code === BOOKING_ERROR_CODES.LEAD_TIME_TOO_SHORT) {
          failure = {
            kind: "leadTime",
            minLeadTimeHours: readMinLeadTimeHours(errorBody),
          };
        } else if (status === HTTP_STATUS.CONFLICT) {
          failure = { kind: "artistUnavailable" };
        } else if (status === HTTP_STATUS.NOT_FOUND) {
          failure = { kind: "artistNotFound" };
        } else {
          failure = { kind: "generic" };
        }
      },
    },
  );
  if (data) return { ok: true, data };
  return { ok: false, error: failure };
}
