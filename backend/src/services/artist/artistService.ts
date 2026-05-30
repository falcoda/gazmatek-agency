import {
  ArtistDetailDto,
  ArtistLanguage,
  ArtistLevel,
  ArtistListPagination,
  ArtistListResponse,
  ArtistPhotoDto,
  ArtistSetType,
  ArtistSummaryDto,
} from "@src/controllers/artist/types";
import { countPublishedArtists } from "@src/db/query/artist/countPublishedArtists.types";
import { getArtistBySlug } from "@src/db/query/artist/getArtistBySlug.types";
import { listArtistPhotos } from "@src/db/query/artist/listArtistPhotos.types";
import { listArtistsWithFilters } from "@src/db/query/artist/listArtistsWithFilters.types";
import { NotFoundError } from "@src/helpers/error/errors";
import { Pool } from "pg";

const BIO_FALLBACK_ORDER: readonly ArtistLanguage[] = ["en", "fr", "nl"];

interface BioFields {
  bio_fr: string | null;
  bio_nl: string | null;
  bio_en: string | null;
}

interface AltFields {
  alt_fr: string | null;
  alt_nl: string | null;
  alt_en: string | null;
}

interface ListPublicFilters {
  featured?: boolean;
  genre?: string;
  page: number;
  pageSize: number;
  lang?: ArtistLanguage;
}

function pickLocalizedBio(
  row: BioFields,
  preferred: ArtistLanguage | undefined,
): string | null {
  const candidates: ArtistLanguage[] = preferred
    ? [preferred, ...BIO_FALLBACK_ORDER.filter((l) => l !== preferred)]
    : [...BIO_FALLBACK_ORDER];

  for (const lang of candidates) {
    const value =
      lang === "fr" ? row.bio_fr : lang === "nl" ? row.bio_nl : row.bio_en;
    if (value && value.trim().length > 0) {
      return value;
    }
  }
  return null;
}

function pickLocalizedAlt(
  row: AltFields,
  preferred: ArtistLanguage | undefined,
): string | null {
  const candidates: ArtistLanguage[] = preferred
    ? [preferred, ...BIO_FALLBACK_ORDER.filter((l) => l !== preferred)]
    : [...BIO_FALLBACK_ORDER];

  for (const lang of candidates) {
    const value =
      lang === "fr" ? row.alt_fr : lang === "nl" ? row.alt_nl : row.alt_en;
    if (value && value.trim().length > 0) {
      return value;
    }
  }
  return null;
}

// node-postgres does not register a parser for custom enum arrays, so values
// arrive either as a real array (built-in parser fallback) or as a raw pg
// array literal like "{dj,hybrid,live}". Normalize both shapes here.
function normalizeSetTypes(value: readonly string[] | string): ArtistSetType[] {
  if (Array.isArray(value)) return value as ArtistSetType[];
  if (typeof value !== "string") return [];
  const trimmed = value.replace(/^\{|\}$/g, "");
  if (trimmed.length === 0) return [];
  return trimmed
    .split(",")
    .map((part) => part.replace(/^"|"$/g, "").trim())
    .filter((part) => part.length > 0) as ArtistSetType[];
}

function toSummary(
  row: {
    id: string;
    slug: string;
    stage_name: string;
    genre: string | null;
    is_featured: boolean;
    cover_image_url: string | null;
    // pgtyped types these columns as string-literal unions (artist_level /
    // artist_set_type[]); cast to the shared enum types below.
    level: string;
    supported_set_types: readonly string[] | string;
  } & BioFields,
  lang: ArtistLanguage | undefined,
): ArtistSummaryDto {
  return {
    id: row.id,
    slug: row.slug,
    stageName: row.stage_name,
    bio: pickLocalizedBio(row, lang),
    genre: row.genre,
    isFeatured: row.is_featured,
    coverImageUrl: row.cover_image_url,
    level: row.level as ArtistLevel,
    supportedSetTypes: normalizeSetTypes(row.supported_set_types),
  };
}

export class ArtistService {
  constructor(private db: Pool) {}

  async listPublic(filters: ListPublicFilters): Promise<ArtistListResponse> {
    const { page, pageSize, lang } = filters;
    const offset = (page - 1) * pageSize;

    const params = {
      onlyFeatured: filters.featured ?? null,
      genre: filters.genre ?? null,
    };

    const [rows, countRows] = await Promise.all([
      listArtistsWithFilters.run(
        {
          ...params,
          pageLimit: pageSize,
          pageOffset: offset,
        },
        this.db,
      ),
      countPublishedArtists.run(params, this.db),
    ]);

    const total = countRows[0]?.total ?? 0;
    const pagination: ArtistListPagination = {
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    };

    return {
      data: rows.map((row) => toSummary(row, lang)),
      pagination,
    };
  }

  async getBySlug(
    slug: string,
    lang?: ArtistLanguage,
  ): Promise<ArtistDetailDto> {
    const rows = await getArtistBySlug.run({ slug }, this.db);
    if (rows.length === 0) {
      throw new NotFoundError("Artist not found");
    }

    const artist = rows[0];
    const photoRows = await listArtistPhotos.run(
      { artistId: artist.id },
      this.db,
    );

    const photos: ArtistPhotoDto[] = photoRows.map((photo) => ({
      id: photo.id,
      url: photo.url,
      alt: pickLocalizedAlt(photo, lang),
      position: photo.position,
    }));

    return {
      ...toSummary(artist, lang),
      photos,
    };
  }
}

export default ArtistService;
