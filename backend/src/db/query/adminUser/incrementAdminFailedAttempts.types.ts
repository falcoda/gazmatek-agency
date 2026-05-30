/** Types generated for queries found in "src/db/query/adminUser/incrementAdminFailedAttempts.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'IncrementAdminFailedAttempts' parameters type */
export interface IIncrementAdminFailedAttemptsParams {
  adminId: string;
}

/** 'IncrementAdminFailedAttempts' return type */
export interface IIncrementAdminFailedAttemptsResult {
  failed_login_attempts: number;
}

/** 'IncrementAdminFailedAttempts' query type */
export interface IIncrementAdminFailedAttemptsQuery {
  params: IIncrementAdminFailedAttemptsParams;
  result: IIncrementAdminFailedAttemptsResult;
}

const incrementAdminFailedAttemptsIR: any = {"usedParamSet":{"adminId":true},"params":[{"name":"adminId","required":true,"transform":{"type":"scalar"},"locs":[{"a":218,"b":226}]}],"statement":"UPDATE admin_users\nSET failed_login_attempts = failed_login_attempts + 1,\n    locked_until = CASE\n      WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'\n      ELSE locked_until\n    END\nWHERE id = :adminId!\nRETURNING failed_login_attempts"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE admin_users
 * SET failed_login_attempts = failed_login_attempts + 1,
 *     locked_until = CASE
 *       WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
 *       ELSE locked_until
 *     END
 * WHERE id = :adminId!
 * RETURNING failed_login_attempts
 * ```
 */
export const incrementAdminFailedAttempts = new PreparedQuery<IIncrementAdminFailedAttemptsParams,IIncrementAdminFailedAttemptsResult>(incrementAdminFailedAttemptsIR);


