/** Types generated for queries found in "src/db/query/clientAccount/incrementClientFailedAttempts.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'IncrementClientFailedAttempts' parameters type */
export interface IIncrementClientFailedAttemptsParams {
  clientId: string;
}

/** 'IncrementClientFailedAttempts' return type */
export interface IIncrementClientFailedAttemptsResult {
  failed_login_attempts: number;
  locked_until: Date | null;
}

/** 'IncrementClientFailedAttempts' query type */
export interface IIncrementClientFailedAttemptsQuery {
  params: IIncrementClientFailedAttemptsParams;
  result: IIncrementClientFailedAttemptsResult;
}

const incrementClientFailedAttemptsIR: any = {"usedParamSet":{"clientId":true},"params":[{"name":"clientId","required":true,"transform":{"type":"scalar"},"locs":[{"a":222,"b":231}]}],"statement":"UPDATE client_accounts\nSET failed_login_attempts = failed_login_attempts + 1,\n    locked_until = CASE\n      WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'\n      ELSE locked_until\n    END\nWHERE id = :clientId!\nRETURNING failed_login_attempts, locked_until"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE client_accounts
 * SET failed_login_attempts = failed_login_attempts + 1,
 *     locked_until = CASE
 *       WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
 *       ELSE locked_until
 *     END
 * WHERE id = :clientId!
 * RETURNING failed_login_attempts, locked_until
 * ```
 */
export const incrementClientFailedAttempts = new PreparedQuery<IIncrementClientFailedAttemptsParams,IIncrementClientFailedAttemptsResult>(incrementClientFailedAttemptsIR);


