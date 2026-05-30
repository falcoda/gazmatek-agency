/** Types generated for queries found in "src/db/query/artist/getArtistBySlug.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_level = 'L1' | 'L2' | 'L3' | 'L4';

export type artist_set_type = 'dj' | 'hybrid' | 'live';

export type artist_set_typeArray = (artist_set_type)[];

/** 'GetArtistBySlug' parameters type */
export interface IGetArtistBySlugParams {
  slug: string;
}

/** 'GetArtistBySlug' return type */
export interface IGetArtistBySlugResult {
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
  supported_set_types: artist_set_typeArray;
  updated_at: Date;
}

/** 'GetArtistBySlug' query type */
export interface IGetArtistBySlugQuery {
  params: IGetArtistBySlugParams;
  result: IGetArtistBySlugResult;
}

const getArtistBySlugIR: any = {"usedParamSet":{"slug":true},"params":[{"name":"slug","required":true,"transform":{"type":"scalar"},"locs":[{"a":264,"b":269}]}],"statement":"-- Fetch a single published artist by its public slug.\nSELECT\n  id,\n  slug,\n  stage_name,\n  bio_fr,\n  bio_nl,\n  bio_en,\n  genre,\n  is_featured,\n  is_published,\n  cover_image_url,\n  level,\n  supported_set_types,\n  created_at,\n  updated_at\nFROM artists\nWHERE slug = :slug!\n  AND is_published = TRUE"};

/**
 * Query generated from SQL:
 * ```
 * -- Fetch a single published artist by its public slug.
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
 *   supported_set_types,
 *   created_at,
 *   updated_at
 * FROM artists
 * WHERE slug = :slug!
 *   AND is_published = TRUE
 * ```
 */
export const getArtistBySlug = new PreparedQuery<IGetArtistBySlugParams,IGetArtistBySlugResult>(getArtistBySlugIR);


