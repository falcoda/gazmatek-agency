// Single source of truth for artist level / set-type unions (Rule 4: no
// parallel string-literal declarations). Imported locally so they can be used
// as types in this file, and re-exported so existing consumers keep importing
// them from the artist controller types barrel.
import { ArtistLevel, ArtistSetType } from "@src/helpers/constants/artist";

export { ArtistLevel, ArtistSetType };

export type ArtistLanguage = "fr" | "nl" | "en";

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
