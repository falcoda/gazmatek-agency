import { buildArtistAvailabilityUrl } from "@/config/apiRoutes";
import { publicFetch } from "@/Utils/Services/Public/publicFetch";

export type AvailabilityDayStatus = "free" | "partial" | "busy";

export interface AvailabilityResponse {
  days: { date: string; status: AvailabilityDayStatus }[];
}

export async function fetchAvailability(
  artistId: string,
  from: string,
  to: string,
): Promise<AvailabilityResponse | null> {
  const qs = new URLSearchParams({ from, to }).toString();
  return publicFetch<AvailabilityResponse>(
    `${buildArtistAvailabilityUrl(artistId)}?${qs}`,
    { silent: true },
  );
}
