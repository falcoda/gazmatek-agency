/** Types generated for queries found in "src/db/query/artistAccount/updateArtistPassword.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpdateArtistPassword' parameters type */
export interface IUpdateArtistPasswordParams {
  artistId: string;
  newPasswordHash: string;
}

/** 'UpdateArtistPassword' return type */
export interface IUpdateArtistPasswordResult {
  artist_id: string;
}

/** 'UpdateArtistPassword' query type */
export interface IUpdateArtistPasswordQuery {
  params: IUpdateArtistPasswordParams;
  result: IUpdateArtistPasswordResult;
}

const updateArtistPasswordIR: any = {"usedParamSet":{"newPasswordHash":true,"artistId":true},"params":[{"name":"newPasswordHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":43,"b":59}]},{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":79,"b":88}]}],"statement":"UPDATE artist_accounts\nSET password_hash = :newPasswordHash!\nWHERE artist_id = :artistId!\nRETURNING artist_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE artist_accounts
 * SET password_hash = :newPasswordHash!
 * WHERE artist_id = :artistId!
 * RETURNING artist_id
 * ```
 */
export const updateArtistPassword = new PreparedQuery<IUpdateArtistPasswordParams,IUpdateArtistPasswordResult>(updateArtistPasswordIR);


