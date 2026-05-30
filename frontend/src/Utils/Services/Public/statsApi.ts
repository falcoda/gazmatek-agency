import { API_ROUTES } from "@/config/apiRoutes";
import { publicFetch } from "@/Utils/Services/Public/publicFetch";

export interface HomeStats {
  publishedArtists: number;
  producedEvents: number;
}

export async function fetchHomeStats(): Promise<HomeStats | null> {
  return publicFetch<HomeStats>(API_ROUTES.statsHome, { silent: true });
}
