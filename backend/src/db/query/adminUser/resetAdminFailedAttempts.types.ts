/** Types generated for queries found in "src/db/query/adminUser/resetAdminFailedAttempts.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ResetAdminFailedAttempts' parameters type */
export interface IResetAdminFailedAttemptsParams {
  adminId: string;
}

/** 'ResetAdminFailedAttempts' return type */
export interface IResetAdminFailedAttemptsResult {
  id: string;
}

/** 'ResetAdminFailedAttempts' query type */
export interface IResetAdminFailedAttemptsQuery {
  params: IResetAdminFailedAttemptsParams;
  result: IResetAdminFailedAttemptsResult;
}

const resetAdminFailedAttemptsIR: any = {"usedParamSet":{"adminId":true},"params":[{"name":"adminId","required":true,"transform":{"type":"scalar"},"locs":[{"a":112,"b":120}]}],"statement":"UPDATE admin_users\nSET failed_login_attempts = 0,\n    locked_until = NULL,\n    last_login_at = NOW()\nWHERE id = :adminId!\nRETURNING id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE admin_users
 * SET failed_login_attempts = 0,
 *     locked_until = NULL,
 *     last_login_at = NOW()
 * WHERE id = :adminId!
 * RETURNING id
 * ```
 */
export const resetAdminFailedAttempts = new PreparedQuery<IResetAdminFailedAttemptsParams,IResetAdminFailedAttemptsResult>(resetAdminFailedAttemptsIR);


