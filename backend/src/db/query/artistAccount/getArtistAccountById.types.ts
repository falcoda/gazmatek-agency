/** Types generated for queries found in "src/db/query/artistAccount/getArtistAccountById.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetArtistAccountById' parameters type */
export interface IGetArtistAccountByIdParams {
  artistId: string;
}

/** 'GetArtistAccountById' return type */
export interface IGetArtistAccountByIdResult {
  artist_id: string;
  email: string;
  is_active: boolean;
  slug: string;
  stage_name: string;
}

/** 'GetArtistAccountById' query type */
export interface IGetArtistAccountByIdQuery {
  params: IGetArtistAccountByIdParams;
  result: IGetArtistAccountByIdResult;
}

const getArtistAccountByIdIR: any = {"usedParamSet":{"artistId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":156,"b":165}]}],"statement":"SELECT aa.artist_id, aa.email, aa.is_active,\n       a.slug, a.stage_name\nFROM artist_accounts aa\nJOIN artists a ON a.id = aa.artist_id\nWHERE aa.artist_id = :artistId!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT aa.artist_id, aa.email, aa.is_active,
 *        a.slug, a.stage_name
 * FROM artist_accounts aa
 * JOIN artists a ON a.id = aa.artist_id
 * WHERE aa.artist_id = :artistId!
 * LIMIT 1
 * ```
 */
export const getArtistAccountById = new PreparedQuery<IGetArtistAccountByIdParams,IGetArtistAccountByIdResult>(getArtistAccountByIdIR);


