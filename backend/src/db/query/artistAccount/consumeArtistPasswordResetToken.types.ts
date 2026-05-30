/** Types generated for queries found in "src/db/query/artistAccount/consumeArtistPasswordResetToken.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ConsumeArtistPasswordResetToken' parameters type */
export interface IConsumeArtistPasswordResetTokenParams {
  newPasswordHash: string;
  tokenHash: string;
}

/** 'ConsumeArtistPasswordResetToken' return type */
export interface IConsumeArtistPasswordResetTokenResult {
  artist_id: string;
}

/** 'ConsumeArtistPasswordResetToken' query type */
export interface IConsumeArtistPasswordResetTokenQuery {
  params: IConsumeArtistPasswordResetTokenParams;
  result: IConsumeArtistPasswordResetTokenResult;
}

const consumeArtistPasswordResetTokenIR: any = {"usedParamSet":{"newPasswordHash":true,"tokenHash":true},"params":[{"name":"newPasswordHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":43,"b":59}]},{"name":"tokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":227,"b":237}]}],"statement":"UPDATE artist_accounts\nSET password_hash = :newPasswordHash!,\n    password_reset_token_hash = NULL,\n    password_reset_expires_at = NULL,\n    failed_login_attempts = 0,\n    locked_until = NULL\nWHERE password_reset_token_hash = :tokenHash!\n  AND password_reset_expires_at > NOW()\nRETURNING artist_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE artist_accounts
 * SET password_hash = :newPasswordHash!,
 *     password_reset_token_hash = NULL,
 *     password_reset_expires_at = NULL,
 *     failed_login_attempts = 0,
 *     locked_until = NULL
 * WHERE password_reset_token_hash = :tokenHash!
 *   AND password_reset_expires_at > NOW()
 * RETURNING artist_id
 * ```
 */
export const consumeArtistPasswordResetToken = new PreparedQuery<IConsumeArtistPasswordResetTokenParams,IConsumeArtistPasswordResetTokenResult>(consumeArtistPasswordResetTokenIR);


