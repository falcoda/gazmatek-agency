/** Types generated for queries found in "src/db/query/auth/markPasswordResetTokenUsed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'MarkPasswordResetTokenUsed' parameters type */
export interface IMarkPasswordResetTokenUsedParams {
  token: string;
}

/** 'MarkPasswordResetTokenUsed' return type */
export interface IMarkPasswordResetTokenUsedResult {
  token_id: string;
}

/** 'MarkPasswordResetTokenUsed' query type */
export interface IMarkPasswordResetTokenUsedQuery {
  params: IMarkPasswordResetTokenUsedParams;
  result: IMarkPasswordResetTokenUsedResult;
}

const markPasswordResetTokenUsedIR: any = {"usedParamSet":{"token":true},"params":[{"name":"token","required":true,"transform":{"type":"scalar"},"locs":[{"a":63,"b":69}]}],"statement":"UPDATE password_reset_tokens\nSET used_at = NOW()\nWHERE token = :token!\nRETURNING token_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE password_reset_tokens
 * SET used_at = NOW()
 * WHERE token = :token!
 * RETURNING token_id
 * ```
 */
export const markPasswordResetTokenUsed = new PreparedQuery<IMarkPasswordResetTokenUsedParams,IMarkPasswordResetTokenUsedResult>(markPasswordResetTokenUsedIR);


