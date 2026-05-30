/** Types generated for queries found in "src/db/query/artistAccount/getArtistPasswordHash.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetArtistPasswordHash' parameters type */
export interface IGetArtistPasswordHashParams {
  artistId: string;
}

/** 'GetArtistPasswordHash' return type */
export interface IGetArtistPasswordHashResult {
  password_hash: string;
}

/** 'GetArtistPasswordHash' query type */
export interface IGetArtistPasswordHashQuery {
  params: IGetArtistPasswordHashParams;
  result: IGetArtistPasswordHashResult;
}

const getArtistPasswordHashIR: any = {"usedParamSet":{"artistId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":60,"b":69}]}],"statement":"SELECT password_hash\nFROM artist_accounts\nWHERE artist_id = :artistId!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT password_hash
 * FROM artist_accounts
 * WHERE artist_id = :artistId!
 * LIMIT 1
 * ```
 */
export const getArtistPasswordHash = new PreparedQuery<IGetArtistPasswordHashParams,IGetArtistPasswordHashResult>(getArtistPasswordHashIR);


