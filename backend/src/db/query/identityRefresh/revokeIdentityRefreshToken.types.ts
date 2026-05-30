/** Types generated for queries found in "src/db/query/identityRefresh/revokeIdentityRefreshToken.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'RevokeIdentityRefreshToken' parameters type */
export interface IRevokeIdentityRefreshTokenParams {
  tokenHash: string;
}

/** 'RevokeIdentityRefreshToken' return type */
export type IRevokeIdentityRefreshTokenResult = void;

/** 'RevokeIdentityRefreshToken' query type */
export interface IRevokeIdentityRefreshTokenQuery {
  params: IRevokeIdentityRefreshTokenParams;
  result: IRevokeIdentityRefreshTokenResult;
}

const revokeIdentityRefreshTokenIR: any = {"usedParamSet":{"tokenHash":true},"params":[{"name":"tokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":73,"b":83}]}],"statement":"UPDATE identity_refresh_tokens\nSET revoked_at = NOW()\nWHERE token_hash = :tokenHash!\n  AND revoked_at IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE identity_refresh_tokens
 * SET revoked_at = NOW()
 * WHERE token_hash = :tokenHash!
 *   AND revoked_at IS NULL
 * ```
 */
export const revokeIdentityRefreshToken = new PreparedQuery<IRevokeIdentityRefreshTokenParams,IRevokeIdentityRefreshTokenResult>(revokeIdentityRefreshTokenIR);


