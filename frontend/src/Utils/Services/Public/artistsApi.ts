import { API_ROUTES, buildArtistDetailUrl } from "@/config/apiRoutes";
import type { AppLanguage } from "@/i18n/config";
import type {
  ArtistLevel,
  ArtistSetType,
} from "@/Utils/Services/Public/pricingApi";
import { publicFetch } from "@/Utils/Services/Public/publicFetch";

export interface ArtistPhotoDto {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

export interface ArtistSummaryDto {
  id: string;
  slug: string;
  stageName: string;
  bio: string | null;
  genre: string | null;
  isFeatured: boolean;
  coverImageUrl: string | null;
  level: ArtistLevel;
  supportedSetTypes: ArtistSetType[];
}

export interface ArtistDetailDto extends ArtistSummaryDto {
  photos: ArtistPhotoDto[];
}

export interface ArtistListPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ArtistListResponse {
  data: ArtistSummaryDto[];
  pagination: ArtistListPagination;
}

export interface ArtistListFilters {
  featured?: boolean;
  genre?: string;
  availableOn?: string;
  lang?: AppLanguage;
  page?: number;
  pageSize?: number;
  limit?: number;
}

function buildQuery(filters: ArtistListFilters): string {
  const params = new URLSearchParams();
  if (filters.featured !== undefined) {
    params.set("featured", String(filters.featured));
  }
  if (filters.genre) params.set("genre", filters.genre);
  if (filters.availableOn) params.set("available_on", filters.availableOn);
  if (filters.lang) params.set("lang", filters.lang);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.pageSize !== undefined)
    params.set("page_size", String(filters.pageSize));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchArtists(
  filters: ArtistListFilters = {},
): Promise<ArtistListResponse | null> {
  return publicFetch<ArtistListResponse>(
    `${API_ROUTES.artistsList}${buildQuery(filters)}`,
    { silent: true },
  );
}

export async function fetchArtistBySlug(
  slug: string,
  lang?: AppLanguage,
): Promise<ArtistDetailDto | null> {
  const qs = lang ? `?lang=${lang}` : "";
  return publicFetch<ArtistDetailDto>(`${buildArtistDetailUrl(slug)}${qs}`, {
    silent: true,
  });
}
