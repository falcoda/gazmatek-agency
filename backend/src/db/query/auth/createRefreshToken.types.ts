/** Types generated for queries found in "src/db/query/auth/createRefreshToken.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

export type NumberOrString = number | string;

/** 'CreateRefreshToken' parameters type */
export interface ICreateRefreshTokenParams {
  expiresAt: DateOrString;
  token: string;
  userId: NumberOrString;
}

/** 'CreateRefreshToken' return type */
export interface ICreateRefreshTokenResult {
  expires_at: Date;
  token: string;
  token_id: string;
}

/** 'CreateRefreshToken' query type */
export interface ICreateRefreshTokenQuery {
  params: ICreateRefreshTokenParams;
  result: ICreateRefreshTokenResult;
}

const createRefreshTokenIR: any = {"usedParamSet":{"userId":true,"token":true,"expiresAt":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":104,"b":111}]},{"name":"token","required":true,"transform":{"type":"scalar"},"locs":[{"a":114,"b":120}]},{"name":"expiresAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":123,"b":133}]}],"statement":"-- Store a new refresh token for a user\nINSERT INTO refresh_tokens (user_id, token, expires_at)\nVALUES (:userId!, :token!, :expiresAt!)\nRETURNING token_id, token, expires_at"};

/**
 * Query generated from SQL:
 * ```
 * -- Store a new refresh token for a user
 * INSERT INTO refresh_tokens (user_id, token, expires_at)
 * VALUES (:userId!, :token!, :expiresAt!)
 * RETURNING token_id, token, expires_at
 * ```
 */
export const createRefreshToken = new PreparedQuery<ICreateRefreshTokenParams,ICreateRefreshTokenResult>(createRefreshTokenIR);


