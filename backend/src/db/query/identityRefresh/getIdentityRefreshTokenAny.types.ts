/** Types generated for queries found in "src/db/query/identityRefresh/getIdentityRefreshTokenAny.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetIdentityRefreshTokenAny' parameters type */
export interface IGetIdentityRefreshTokenAnyParams {
  tokenHash: string;
}

/** 'GetIdentityRefreshTokenAny' return type */
export interface IGetIdentityRefreshTokenAnyResult {
  expires_at: Date;
  id: string;
  kind: string;
  revoked_at: Date | null;
  subject_id: string;
  token_hash: string;
}

/** 'GetIdentityRefreshTokenAny' query type */
export interface IGetIdentityRefreshTokenAnyQuery {
  params: IGetIdentityRefreshTokenAnyParams;
  result: IGetIdentityRefreshTokenAnyResult;
}

const getIdentityRefreshTokenAnyIR: any = {"usedParamSet":{"tokenHash":true},"params":[{"name":"tokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":423,"b":433}]}],"statement":"-- #21 Reuse detection: unlike getIdentityRefreshToken, this returns a row even\n-- when it has already been revoked (but not yet expired). A presented token that\n-- exists but is revoked means the (rotated, single-use) token was replayed —\n-- treated as theft, triggering a full session revoke for the subject.\nSELECT id, kind, subject_id, token_hash, expires_at, revoked_at\nFROM identity_refresh_tokens\nWHERE token_hash = :tokenHash!\n  AND expires_at > NOW()"};

/**
 * Query generated from SQL:
 * ```
 * -- #21 Reuse detection: unlike getIdentityRefreshToken, this returns a row even
 * -- when it has already been revoked (but not yet expired). A presented token that
 * -- exists but is revoked means the (rotated, single-use) token was replayed —
 * -- treated as theft, triggering a full session revoke for the subject.
 * SELECT id, kind, subject_id, token_hash, expires_at, revoked_at
 * FROM identity_refresh_tokens
 * WHERE token_hash = :tokenHash!
 *   AND expires_at > NOW()
 * ```
 */
export const getIdentityRefreshTokenAny = new PreparedQuery<IGetIdentityRefreshTokenAnyParams,IGetIdentityRefreshTokenAnyResult>(getIdentityRefreshTokenAnyIR);


