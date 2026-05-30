/** Types generated for queries found in "src/db/query/artistAdmin/getArtistAdminById.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_level = 'L1' | 'L2' | 'L3' | 'L4';

/** 'GetArtistAdminById' parameters type */
export interface IGetArtistAdminByIdParams {
  artistId: string;
}

/** 'GetArtistAdminById' return type */
export interface IGetArtistAdminByIdResult {
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

/** 'GetArtistAdminById' query type */
export interface IGetArtistAdminByIdQuery {
  params: IGetArtistAdminByIdParams;
  result: IGetArtistAdminByIdResult;
}

const getArtistAdminByIdIR: any = {"usedParamSet":{"artistId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":179,"b":188}]}],"statement":"SELECT id, slug, stage_name, bio_fr, bio_nl, bio_en,\n       genre,\n       is_published, is_featured, cover_image_url, level,\n       created_at, updated_at\nFROM artists\nWHERE id = :artistId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, slug, stage_name, bio_fr, bio_nl, bio_en,
 *        genre,
 *        is_published, is_featured, cover_image_url, level,
 *        created_at, updated_at
 * FROM artists
 * WHERE id = :artistId!
 * ```
 */
export const getArtistAdminById = new PreparedQuery<IGetArtistAdminByIdParams,IGetArtistAdminByIdResult>(getArtistAdminByIdIR);


