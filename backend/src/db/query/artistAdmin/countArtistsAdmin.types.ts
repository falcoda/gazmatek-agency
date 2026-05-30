/** Types generated for queries found in "src/db/query/artistAdmin/countArtistsAdmin.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CountArtistsAdmin' parameters type */
export interface ICountArtistsAdminParams {
  searchTerm?: string | null | void;
}

/** 'CountArtistsAdmin' return type */
export interface ICountArtistsAdminResult {
  total: number | null;
}

/** 'CountArtistsAdmin' query type */
export interface ICountArtistsAdminQuery {
  params: ICountArtistsAdminParams;
  result: ICountArtistsAdminResult;
}

const countArtistsAdminIR: any = {"usedParamSet":{"searchTerm":true},"params":[{"name":"searchTerm","required":false,"transform":{"type":"scalar"},"locs":[{"a":50,"b":60},{"a":103,"b":113},{"a":149,"b":159}]}],"statement":"SELECT COUNT(*)::int AS total\nFROM artists\nWHERE (:searchTerm::text IS NULL OR stage_name ILIKE '%' || :searchTerm::text || '%' OR slug ILIKE '%' || :searchTerm::text || '%')"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT(*)::int AS total
 * FROM artists
 * WHERE (:searchTerm::text IS NULL OR stage_name ILIKE '%' || :searchTerm::text || '%' OR slug ILIKE '%' || :searchTerm::text || '%')
 * ```
 */
export const countArtistsAdmin = new PreparedQuery<ICountArtistsAdminParams,ICountArtistsAdminResult>(countArtistsAdminIR);


