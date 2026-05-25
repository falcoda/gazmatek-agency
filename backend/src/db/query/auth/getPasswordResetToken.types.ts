/** Types generated for queries found in "src/db/query/auth/getPasswordResetToken.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetPasswordResetToken' parameters type */
export interface IGetPasswordResetTokenParams {
  token: string;
}

/** 'GetPasswordResetToken' return type */
export interface IGetPasswordResetTokenResult {
  created_at: Date;
  email: string;
  expires_at: Date;
  token: string;
  token_id: string;
  used_at: Date | null;
  user_id: string;
}

/** 'GetPasswordResetToken' query type */
export interface IGetPasswordResetTokenQuery {
  params: IGetPasswordResetTokenParams;
  result: IGetPasswordResetTokenResult;
}

const getPasswordResetTokenIR: any = {"usedParamSet":{"token":true},"params":[{"name":"token","required":true,"transform":{"type":"scalar"},"locs":[{"a":201,"b":207}]}],"statement":"SELECT\n  prt.token_id,\n  prt.user_id,\n  prt.token,\n  prt.expires_at,\n  prt.used_at,\n  prt.created_at,\n  u.email\nFROM password_reset_tokens prt\nJOIN users u ON u.user_id = prt.user_id\nWHERE prt.token = :token!\n  AND prt.used_at IS NULL\n  AND prt.expires_at > NOW()"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   prt.token_id,
 *   prt.user_id,
 *   prt.token,
 *   prt.expires_at,
 *   prt.used_at,
 *   prt.created_at,
 *   u.email
 * FROM password_reset_tokens prt
 * JOIN users u ON u.user_id = prt.user_id
 * WHERE prt.token = :token!
 *   AND prt.used_at IS NULL
 *   AND prt.expires_at > NOW()
 * ```
 */
export const getPasswordResetToken = new PreparedQuery<IGetPasswordResetTokenParams,IGetPasswordResetTokenResult>(getPasswordResetTokenIR);


