/** Types generated for queries found in "src/db/query/artist/countPublishedArtists.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CountPublishedArtists' parameters type */
export interface ICountPublishedArtistsParams {
  genre?: string | null | void;
  onlyFeatured?: boolean | null | void;
}

/** 'CountPublishedArtists' return type */
export interface ICountPublishedArtistsResult {
  total: number | null;
}

/** 'CountPublishedArtists' query type */
export interface ICountPublishedArtistsQuery {
  params: ICountPublishedArtistsParams;
  result: ICountPublishedArtistsResult;
}

const countPublishedArtistsIR: any = {"usedParamSet":{"onlyFeatured":true,"genre":true},"params":[{"name":"onlyFeatured","required":false,"transform":{"type":"scalar"},"locs":[{"a":130,"b":142},{"a":164,"b":176}]},{"name":"genre","required":false,"transform":{"type":"scalar"},"locs":[{"a":225,"b":230},{"a":257,"b":262}]}],"statement":"-- Counts published artists matching catalog filters.\nSELECT COUNT(*)::int AS total\nFROM artists\nWHERE is_published = TRUE\n  AND (:onlyFeatured::boolean IS NULL OR :onlyFeatured::boolean = FALSE OR is_featured = TRUE)\n  AND (:genre::text IS NULL OR genre = :genre::text)"};

/**
 * Query generated from SQL:
 * ```
 * -- Counts published artists matching catalog filters.
 * SELECT COUNT(*)::int AS total
 * FROM artists
 * WHERE is_published = TRUE
 *   AND (:onlyFeatured::boolean IS NULL OR :onlyFeatured::boolean = FALSE OR is_featured = TRUE)
 *   AND (:genre::text IS NULL OR genre = :genre::text)
 * ```
 */
export const countPublishedArtists = new PreparedQuery<ICountPublishedArtistsParams,ICountPublishedArtistsResult>(countPublishedArtistsIR);


