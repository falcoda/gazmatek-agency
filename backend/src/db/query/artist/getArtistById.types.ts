/** Types generated for queries found in "src/db/query/artist/getArtistById.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_level = 'L1' | 'L2' | 'L3' | 'L4';

/** 'GetArtistById' parameters type */
export interface IGetArtistByIdParams {
  artistId: string;
}

/** 'GetArtistById' return type */
export interface IGetArtistByIdResult {
  bio_en: string | null;
  bio_fr: string | null;
  bio_nl: string | null;
  cover_image_url: string | null;
  created_at: Date;
  genre: string | null;
  id: string;
  is_featured: boolean;
  is_published: boolean;
  level: artist_level;
  slug: string;
  stage_name: string;
  updated_at: Date;
}

/** 'GetArtistById' query type */
export interface IGetArtistByIdQuery {
  params: IGetArtistByIdParams;
  result: IGetArtistByIdResult;
}

const getArtistByIdIR: any = {"usedParamSet":{"artistId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":226,"b":235}]}],"statement":"-- Fetch a single published artist by id.\nSELECT\n  id,\n  slug,\n  stage_name,\n  bio_fr,\n  bio_nl,\n  bio_en,\n  genre,\n  is_featured,\n  is_published,\n  cover_image_url,\n  level,\n  created_at,\n  updated_at\nFROM artists\nWHERE id = :artistId!\n  AND is_published = TRUE"};

/**
 * Query generated from SQL:
 * ```
 * -- Fetch a single published artist by id.
 * SELECT
 *   id,
 *   slug,
 *   stage_name,
 *   bio_fr,
 *   bio_nl,
 *   bio_en,
 *   genre,
 *   is_featured,
 *   is_published,
 *   cover_image_url,
 *   level,
 *   created_at,
 *   updated_at
 * FROM artists
 * WHERE id = :artistId!
 *   AND is_published = TRUE
 * ```
 */
export const getArtistById = new PreparedQuery<IGetArtistByIdParams,IGetArtistByIdResult>(getArtistByIdIR);


