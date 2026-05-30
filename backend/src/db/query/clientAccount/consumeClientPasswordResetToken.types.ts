/** Types generated for queries found in "src/db/query/clientAccount/consumeClientPasswordResetToken.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ConsumeClientPasswordResetToken' parameters type */
export interface IConsumeClientPasswordResetTokenParams {
  newPasswordHash: string;
  tokenHash: string;
}

/** 'ConsumeClientPasswordResetToken' return type */
export interface IConsumeClientPasswordResetTokenResult {
  display_name: string | null;
  email: string | null;
  id: string;
}

/** 'ConsumeClientPasswordResetToken' query type */
export interface IConsumeClientPasswordResetTokenQuery {
  params: IConsumeClientPasswordResetTokenParams;
  result: IConsumeClientPasswordResetTokenResult;
}

const consumeClientPasswordResetTokenIR: any = {"usedParamSet":{"newPasswordHash":true,"tokenHash":true},"params":[{"name":"newPasswordHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":277,"b":293}]},{"name":"tokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":507,"b":517}]}],"statement":"-- Used by both flows:\n--   1. \"Forgot password\" — claimed_at is already set, password is just rotated.\n--   2. \"Claim invitation\" (admin-created stub) — claimed_at is NULL and gets\n--      set here, marking the account as activated.\nUPDATE client_accounts\nSET password_hash = :newPasswordHash!,\n    password_reset_token_hash = NULL,\n    password_reset_expires_at = NULL,\n    failed_login_attempts = 0,\n    locked_until = NULL,\n    claimed_at = COALESCE(claimed_at, NOW())\nWHERE password_reset_token_hash = :tokenHash!\n  AND password_reset_expires_at > NOW()\nRETURNING id, email, display_name"};

/**
 * Query generated from SQL:
 * ```
 * -- Used by both flows:
 * --   1. "Forgot password" — claimed_at is already set, password is just rotated.
 * --   2. "Claim invitation" (admin-created stub) — claimed_at is NULL and gets
 * --      set here, marking the account as activated.
 * UPDATE client_accounts
 * SET password_hash = :newPasswordHash!,
 *     password_reset_token_hash = NULL,
 *     password_reset_expires_at = NULL,
 *     failed_login_attempts = 0,
 *     locked_until = NULL,
 *     claimed_at = COALESCE(claimed_at, NOW())
 * WHERE password_reset_token_hash = :tokenHash!
 *   AND password_reset_expires_at > NOW()
 * RETURNING id, email, display_name
 * ```
 */
export const consumeClientPasswordResetToken = new PreparedQuery<IConsumeClientPasswordResetTokenParams,IConsumeClientPasswordResetTokenResult>(consumeClientPasswordResetTokenIR);


