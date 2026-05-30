/** Types generated for queries found in "src/db/query/artist/listArtistsWithFilters.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_level = 'L1' | 'L2' | 'L3' | 'L4';

export type artist_set_type = 'dj' | 'hybrid' | 'live';

export type NumberOrString = number | string;

export type artist_set_typeArray = (artist_set_type)[];

/** 'ListArtistsWithFilters' parameters type */
export interface IListArtistsWithFiltersParams {
  genre?: string | null | void;
  onlyFeatured?: boolean | null | void;
  pageLimit: NumberOrString;
  pageOffset: NumberOrString;
}

/** 'ListArtistsWithFilters' return type */
export interface IListArtistsWithFiltersResult {
  bio_en: string | null;
  bio_fr: string | null;
  bio_nl: string | null;
  cover_image_url: string | null;
  created_at: Date;
  genre: string | null;
  id: string;
  is_featured: boolean;
  level: artist_level;
  slug: string;
  stage_name: string;
  supported_set_types: artist_set_typeArray;
  updated_at: Date;
}

/** 'ListArtistsWithFilters' query type */
export interface IListArtistsWithFiltersQuery {
  params: IListArtistsWithFiltersParams;
  result: IListArtistsWithFiltersResult;
}

const listArtistsWithFiltersIR: any = {"usedParamSet":{"onlyFeatured":true,"genre":true,"pageLimit":true,"pageOffset":true},"params":[{"name":"onlyFeatured","required":false,"transform":{"type":"scalar"},"locs":[{"a":297,"b":309},{"a":331,"b":343}]},{"name":"genre","required":false,"transform":{"type":"scalar"},"locs":[{"a":392,"b":397},{"a":424,"b":429}]},{"name":"pageLimit","required":true,"transform":{"type":"scalar"},"locs":[{"a":486,"b":496}]},{"name":"pageOffset","required":true,"transform":{"type":"scalar"},"locs":[{"a":505,"b":516}]}],"statement":"-- List published artists with optional filters: genre, price range, featured-only.\nSELECT\n  id,\n  slug,\n  stage_name,\n  bio_fr,\n  bio_nl,\n  bio_en,\n  genre,\n  is_featured,\n  cover_image_url,\n  level,\n  supported_set_types,\n  created_at,\n  updated_at\nFROM artists\nWHERE is_published = TRUE\n  AND (:onlyFeatured::boolean IS NULL OR :onlyFeatured::boolean = FALSE OR is_featured = TRUE)\n  AND (:genre::text IS NULL OR genre = :genre::text)\nORDER BY is_featured DESC, stage_name ASC\nLIMIT :pageLimit!\nOFFSET :pageOffset!"};

/**
 * Query generated from SQL:
 * ```
 * -- List published artists with optional filters: genre, price range, featured-only.
 * SELECT
 *   id,
 *   slug,
 *   stage_name,
 *   bio_fr,
 *   bio_nl,
 *   bio_en,
 *   genre,
 *   is_featured,
 *   cover_image_url,
 *   level,
 *   supported_set_types,
 *   created_at,
 *   updated_at
 * FROM artists
 * WHERE is_published = TRUE
 *   AND (:onlyFeatured::boolean IS NULL OR :onlyFeatured::boolean = FALSE OR is_featured = TRUE)
 *   AND (:genre::text IS NULL OR genre = :genre::text)
 * ORDER BY is_featured DESC, stage_name ASC
 * LIMIT :pageLimit!
 * OFFSET :pageOffset!
 * ```
 */
export const listArtistsWithFilters = new PreparedQuery<IListArtistsWithFiltersParams,IListArtistsWithFiltersResult>(listArtistsWithFiltersIR);


