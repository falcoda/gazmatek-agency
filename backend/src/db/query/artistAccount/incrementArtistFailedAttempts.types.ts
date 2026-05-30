/** Types generated for queries found in "src/db/query/artistAccount/incrementArtistFailedAttempts.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'IncrementArtistFailedAttempts' parameters type */
export interface IIncrementArtistFailedAttemptsParams {
  artistId: string;
}

/** 'IncrementArtistFailedAttempts' return type */
export interface IIncrementArtistFailedAttemptsResult {
  failed_login_attempts: number;
  locked_until: Date | null;
}

/** 'IncrementArtistFailedAttempts' query type */
export interface IIncrementArtistFailedAttemptsQuery {
  params: IIncrementArtistFailedAttemptsParams;
  result: IIncrementArtistFailedAttemptsResult;
}

const incrementArtistFailedAttemptsIR: any = {"usedParamSet":{"artistId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":229,"b":238}]}],"statement":"UPDATE artist_accounts\nSET failed_login_attempts = failed_login_attempts + 1,\n    locked_until = CASE\n      WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'\n      ELSE locked_until\n    END\nWHERE artist_id = :artistId!\nRETURNING failed_login_attempts, locked_until"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE artist_accounts
 * SET failed_login_attempts = failed_login_attempts + 1,
 *     locked_until = CASE
 *       WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
 *       ELSE locked_until
 *     END
 * WHERE artist_id = :artistId!
 * RETURNING failed_login_attempts, locked_until
 * ```
 */
export const incrementArtistFailedAttempts = new PreparedQuery<IIncrementArtistFailedAttemptsParams,IIncrementArtistFailedAttemptsResult>(incrementArtistFailedAttemptsIR);


