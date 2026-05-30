/** Types generated for queries found in "src/db/query/artistAdmin/listArtistsAdmin.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_level = 'L1' | 'L2' | 'L3' | 'L4';

export type NumberOrString = number | string;

/** 'ListArtistsAdmin' parameters type */
export interface IListArtistsAdminParams {
  pageLimit: NumberOrString;
  pageOffset: NumberOrString;
  searchTerm?: string | null | void;
}

/** 'ListArtistsAdmin' return type */
export interface IListArtistsAdminResult {
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

/** 'ListArtistsAdmin' query type */
export interface IListArtistsAdminQuery {
  params: IListArtistsAdminParams;
  result: IListArtistsAdminResult;
}

const listArtistsAdminIR: any = {"usedParamSet":{"searchTerm":true,"pageLimit":true,"pageOffset":true},"params":[{"name":"searchTerm","required":false,"transform":{"type":"scalar"},"locs":[{"a":144,"b":154},{"a":197,"b":207},{"a":243,"b":253}]},{"name":"pageLimit","required":true,"transform":{"type":"scalar"},"locs":[{"a":300,"b":310}]},{"name":"pageOffset","required":true,"transform":{"type":"scalar"},"locs":[{"a":319,"b":330}]}],"statement":"SELECT id, slug, stage_name,\n       genre, is_published, is_featured, cover_image_url, level,\n       created_at, updated_at\nFROM artists\nWHERE (:searchTerm::text IS NULL OR stage_name ILIKE '%' || :searchTerm::text || '%' OR slug ILIKE '%' || :searchTerm::text || '%')\nORDER BY created_at DESC\nLIMIT :pageLimit!\nOFFSET :pageOffset!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, slug, stage_name,
 *        genre, is_published, is_featured, cover_image_url, level,
 *        created_at, updated_at
 * FROM artists
 * WHERE (:searchTerm::text IS NULL OR stage_name ILIKE '%' || :searchTerm::text || '%' OR slug ILIKE '%' || :searchTerm::text || '%')
 * ORDER BY created_at DESC
 * LIMIT :pageLimit!
 * OFFSET :pageOffset!
 * ```
 */
export const listArtistsAdmin = new PreparedQuery<IListArtistsAdminParams,IListArtistsAdminResult>(listArtistsAdminIR);


