/** Types generated for queries found in "src/db/query/auth/deleteRefreshToken.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteRefreshToken' parameters type */
export interface IDeleteRefreshTokenParams {
  token: string;
}

/** 'DeleteRefreshToken' return type */
export interface IDeleteRefreshTokenResult {
  token_id: string;
}

/** 'DeleteRefreshToken' query type */
export interface IDeleteRefreshTokenQuery {
  params: IDeleteRefreshTokenParams;
  result: IDeleteRefreshTokenResult;
}

const deleteRefreshTokenIR: any = {"usedParamSet":{"token":true},"params":[{"name":"token","required":true,"transform":{"type":"scalar"},"locs":[{"a":76,"b":82}]}],"statement":"-- Delete a refresh token (logout)\nDELETE FROM refresh_tokens\nWHERE token = :token!\nRETURNING token_id"};

/**
 * Query generated from SQL:
 * ```
 * -- Delete a refresh token (logout)
 * DELETE FROM refresh_tokens
 * WHERE token = :token!
 * RETURNING token_id
 * ```
 */
export const deleteRefreshToken = new PreparedQuery<IDeleteRefreshTokenParams,IDeleteRefreshTokenResult>(deleteRefreshTokenIR);


