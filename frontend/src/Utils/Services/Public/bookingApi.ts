import { API_ROUTES } from "@/config/apiRoutes";
import { clientFetch } from "@/Utils/Services/Authenticated/clientFetch";
import type { ArtistSetType } from "@/Utils/Services/Public/pricingApi";

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
