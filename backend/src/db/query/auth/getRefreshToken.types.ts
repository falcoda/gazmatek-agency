/** Types generated for queries found in "src/db/query/auth/getRefreshToken.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetRefreshToken' parameters type */
export interface IGetRefreshTokenParams {
  token: string;
}

/** 'GetRefreshToken' return type */
export interface IGetRefreshTokenResult {
  email: string;
  expires_at: Date;
  token: string;
  token_id: string;
  user_id: string;
}

/** 'GetRefreshToken' query type */
export interface IGetRefreshTokenQuery {
  params: IGetRefreshTokenParams;
  result: IGetRefreshTokenResult;
}

const getRefreshTokenIR: any = {"usedParamSet":{"token":true},"params":[{"name":"token","required":true,"transform":{"type":"scalar"},"locs":[{"a":207,"b":213}]}],"statement":"-- Get a valid (non-expired) refresh token and its user\nSELECT rt.token_id, rt.user_id, rt.token, rt.expires_at,\n       u.email\nFROM refresh_tokens rt\nJOIN users u ON u.user_id = rt.user_id\nWHERE rt.token = :token!\nAND rt.expires_at > NOW()"};

/**
 * Query generated from SQL:
 * ```
 * -- Get a valid (non-expired) refresh token and its user
 * SELECT rt.token_id, rt.user_id, rt.token, rt.expires_at,
 *        u.email
 * FROM refresh_tokens rt
 * JOIN users u ON u.user_id = rt.user_id
 * WHERE rt.token = :token!
 * AND rt.expires_at > NOW()
 * ```
 */
export const getRefreshToken = new PreparedQuery<IGetRefreshTokenParams,IGetRefreshTokenResult>(getRefreshTokenIR);


