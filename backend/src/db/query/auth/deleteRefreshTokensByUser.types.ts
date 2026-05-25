/** Types generated for queries found in "src/db/query/auth/deleteRefreshTokensByUser.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'DeleteRefreshTokensByUser' parameters type */
export interface IDeleteRefreshTokensByUserParams {
  userId: NumberOrString;
}

/** 'DeleteRefreshTokensByUser' return type */
export interface IDeleteRefreshTokensByUserResult {
  token_id: string;
}

/** 'DeleteRefreshTokensByUser' query type */
export interface IDeleteRefreshTokensByUserQuery {
  params: IDeleteRefreshTokensByUserParams;
  result: IDeleteRefreshTokensByUserResult;
}

const deleteRefreshTokensByUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":43,"b":50}]}],"statement":"DELETE FROM refresh_tokens\nWHERE user_id = :userId!\nRETURNING token_id"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM refresh_tokens
 * WHERE user_id = :userId!
 * RETURNING token_id
 * ```
 */
export const deleteRefreshTokensByUser = new PreparedQuery<IDeleteRefreshTokensByUserParams,IDeleteRefreshTokensByUserResult>(deleteRefreshTokensByUserIR);


