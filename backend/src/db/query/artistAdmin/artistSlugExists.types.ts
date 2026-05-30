/** Types generated for queries found in "src/db/query/artistAdmin/artistSlugExists.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ArtistSlugExists' parameters type */
export interface IArtistSlugExistsParams {
  slug: string;
}

/** 'ArtistSlugExists' return type */
export interface IArtistSlugExistsResult {
  slug_exists: boolean | null;
}

/** 'ArtistSlugExists' query type */
export interface IArtistSlugExistsQuery {
  params: IArtistSlugExistsParams;
  result: IArtistSlugExistsResult;
}

const artistSlugExistsIR: any = {"usedParamSet":{"slug":true},"params":[{"name":"slug","required":true,"transform":{"type":"scalar"},"locs":[{"a":49,"b":54}]}],"statement":"SELECT EXISTS(SELECT 1 FROM artists WHERE slug = :slug!) AS slug_exists"};

/**
 * Query generated from SQL:
 * ```
 * SELECT EXISTS(SELECT 1 FROM artists WHERE slug = :slug!) AS slug_exists
 * ```
 */
export const artistSlugExists = new PreparedQuery<IArtistSlugExistsParams,IArtistSlugExistsResult>(artistSlugExistsIR);


