/** Types generated for queries found in "src/db/query/auth/createPasswordResetToken.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

export type NumberOrString = number | string;

/** 'CreatePasswordResetToken' parameters type */
export interface ICreatePasswordResetTokenParams {
  expiresAt: DateOrString;
  token: string;
  userId: NumberOrString;
}

/** 'CreatePasswordResetToken' return type */
export interface ICreatePasswordResetTokenResult {
  created_at: Date;
  expires_at: Date;
  token: string;
  token_id: string;
  used_at: Date | null;
  user_id: string;
}

/** 'CreatePasswordResetToken' query type */
export interface ICreatePasswordResetTokenQuery {
  params: ICreatePasswordResetTokenParams;
  result: ICreatePasswordResetTokenResult;
}

const createPasswordResetTokenIR: any = {"usedParamSet":{"userId":true,"token":true,"expiresAt":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":71,"b":78}]},{"name":"token","required":true,"transform":{"type":"scalar"},"locs":[{"a":81,"b":87}]},{"name":"expiresAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":90,"b":100}]}],"statement":"INSERT INTO password_reset_tokens (user_id, token, expires_at)\nVALUES (:userId!, :token!, :expiresAt!)\nRETURNING token_id, user_id, token, expires_at, used_at, created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO password_reset_tokens (user_id, token, expires_at)
 * VALUES (:userId!, :token!, :expiresAt!)
 * RETURNING token_id, user_id, token, expires_at, used_at, created_at
 * ```
 */
export const createPasswordResetToken = new PreparedQuery<ICreatePasswordResetTokenParams,ICreatePasswordResetTokenResult>(createPasswordResetTokenIR);


