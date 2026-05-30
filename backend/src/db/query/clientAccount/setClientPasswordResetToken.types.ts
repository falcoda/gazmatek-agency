/** Types generated for queries found in "src/db/query/clientAccount/setClientPasswordResetToken.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'SetClientPasswordResetToken' parameters type */
export interface ISetClientPasswordResetTokenParams {
  email: string;
  expiresAt: DateOrString;
  tokenHash: string;
}

/** 'SetClientPasswordResetToken' return type */
export interface ISetClientPasswordResetTokenResult {
  id: string;
}

/** 'SetClientPasswordResetToken' query type */
export interface ISetClientPasswordResetTokenQuery {
  params: ISetClientPasswordResetTokenParams;
  result: ISetClientPasswordResetTokenResult;
}

const setClientPasswordResetTokenIR: any = {"usedParamSet":{"tokenHash":true,"expiresAt":true,"email":true},"params":[{"name":"tokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":55,"b":65}]},{"name":"expiresAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":100,"b":110}]},{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":126,"b":132}]}],"statement":"UPDATE client_accounts\nSET password_reset_token_hash = :tokenHash!,\n    password_reset_expires_at = :expiresAt!\nWHERE email = :email!\nRETURNING id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE client_accounts
 * SET password_reset_token_hash = :tokenHash!,
 *     password_reset_expires_at = :expiresAt!
 * WHERE email = :email!
 * RETURNING id
 * ```
 */
export const setClientPasswordResetToken = new PreparedQuery<ISetClientPasswordResetTokenParams,ISetClientPasswordResetTokenResult>(setClientPasswordResetTokenIR);


