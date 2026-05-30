/** Types generated for queries found in "src/db/query/clientAccount/resetClientFailedAttempts.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ResetClientFailedAttempts' parameters type */
export interface IResetClientFailedAttemptsParams {
  clientId: string;
}

/** 'ResetClientFailedAttempts' return type */
export interface IResetClientFailedAttemptsResult {
  id: string;
}

/** 'ResetClientFailedAttempts' query type */
export interface IResetClientFailedAttemptsQuery {
  params: IResetClientFailedAttemptsParams;
  result: IResetClientFailedAttemptsResult;
}

const resetClientFailedAttemptsIR: any = {"usedParamSet":{"clientId":true},"params":[{"name":"clientId","required":true,"transform":{"type":"scalar"},"locs":[{"a":116,"b":125}]}],"statement":"UPDATE client_accounts\nSET failed_login_attempts = 0,\n    locked_until = NULL,\n    last_login_at = NOW()\nWHERE id = :clientId!\nRETURNING id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE client_accounts
 * SET failed_login_attempts = 0,
 *     locked_until = NULL,
 *     last_login_at = NOW()
 * WHERE id = :clientId!
 * RETURNING id
 * ```
 */
export const resetClientFailedAttempts = new PreparedQuery<IResetClientFailedAttemptsParams,IResetClientFailedAttemptsResult>(resetClientFailedAttemptsIR);


