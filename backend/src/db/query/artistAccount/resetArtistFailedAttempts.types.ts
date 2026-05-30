/** Types generated for queries found in "src/db/query/artistAccount/resetArtistFailedAttempts.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ResetArtistFailedAttempts' parameters type */
export interface IResetArtistFailedAttemptsParams {
  artistId: string;
}

/** 'ResetArtistFailedAttempts' return type */
export interface IResetArtistFailedAttemptsResult {
  artist_id: string;
}

/** 'ResetArtistFailedAttempts' query type */
export interface IResetArtistFailedAttemptsQuery {
  params: IResetArtistFailedAttemptsParams;
  result: IResetArtistFailedAttemptsResult;
}

const resetArtistFailedAttemptsIR: any = {"usedParamSet":{"artistId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":123,"b":132}]}],"statement":"UPDATE artist_accounts\nSET failed_login_attempts = 0,\n    locked_until = NULL,\n    last_login_at = NOW()\nWHERE artist_id = :artistId!\nRETURNING artist_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE artist_accounts
 * SET failed_login_attempts = 0,
 *     locked_until = NULL,
 *     last_login_at = NOW()
 * WHERE artist_id = :artistId!
 * RETURNING artist_id
 * ```
 */
export const resetArtistFailedAttempts = new PreparedQuery<IResetArtistFailedAttemptsParams,IResetArtistFailedAttemptsResult>(resetArtistFailedAttemptsIR);


