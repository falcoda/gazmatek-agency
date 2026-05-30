/** Types generated for queries found in "src/db/query/identityRefresh/getIdentityRefreshToken.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetIdentityRefreshToken' parameters type */
export interface IGetIdentityRefreshTokenParams {
  tokenHash: string;
}

/** 'GetIdentityRefreshToken' return type */
export interface IGetIdentityRefreshTokenResult {
  expires_at: Date;
  id: string;
  kind: string;
  revoked_at: Date | null;
  subject_id: string;
  token_hash: string;
}

/** 'GetIdentityRefreshToken' query type */
export interface IGetIdentityRefreshTokenQuery {
  params: IGetIdentityRefreshTokenParams;
  result: IGetIdentityRefreshTokenResult;
}

const getIdentityRefreshTokenIR: any = {"usedParamSet":{"tokenHash":true},"params":[{"name":"tokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":112,"b":122}]}],"statement":"SELECT id, kind, subject_id, token_hash, expires_at, revoked_at\nFROM identity_refresh_tokens\nWHERE token_hash = :tokenHash!\n  AND revoked_at IS NULL\n  AND expires_at > NOW()"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, kind, subject_id, token_hash, expires_at, revoked_at
 * FROM identity_refresh_tokens
 * WHERE token_hash = :tokenHash!
 *   AND revoked_at IS NULL
 *   AND expires_at > NOW()
 * ```
 */
export const getIdentityRefreshToken = new PreparedQuery<IGetIdentityRefreshTokenParams,IGetIdentityRefreshTokenResult>(getIdentityRefreshTokenIR);


