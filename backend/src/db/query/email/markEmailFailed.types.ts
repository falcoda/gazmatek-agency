/** Types generated for queries found in "src/db/query/email/markEmailFailed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'MarkEmailFailed' parameters type */
export interface IMarkEmailFailedParams {
  emailId: string;
  lastError: string;
}

/** 'MarkEmailFailed' return type */
export interface IMarkEmailFailedResult {
  attempts: number;
  id: string;
  status: string;
}

/** 'MarkEmailFailed' query type */
export interface IMarkEmailFailedQuery {
  params: IMarkEmailFailedParams;
  result: IMarkEmailFailedResult;
}

const markEmailFailedIR: any = {"usedParamSet":{"lastError":true,"emailId":true},"params":[{"name":"lastError","required":true,"transform":{"type":"scalar"},"locs":[{"a":147,"b":157}]},{"name":"emailId","required":true,"transform":{"type":"scalar"},"locs":[{"a":352,"b":360}]}],"statement":"UPDATE email_deliveries\nSET status = CASE WHEN attempts + 1 >= 3 THEN 'abandoned' ELSE 'failed' END,\n    attempts = attempts + 1,\n    last_error = :lastError!,\n    next_retry_at = NOW() + (\n      CASE attempts\n        WHEN 0 THEN INTERVAL '5 minutes'\n        WHEN 1 THEN INTERVAL '30 minutes'\n        ELSE INTERVAL '2 hours'\n      END\n    )\nWHERE id = :emailId!\nRETURNING id, status, attempts"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE email_deliveries
 * SET status = CASE WHEN attempts + 1 >= 3 THEN 'abandoned' ELSE 'failed' END,
 *     attempts = attempts + 1,
 *     last_error = :lastError!,
 *     next_retry_at = NOW() + (
 *       CASE attempts
 *         WHEN 0 THEN INTERVAL '5 minutes'
 *         WHEN 1 THEN INTERVAL '30 minutes'
 *         ELSE INTERVAL '2 hours'
 *       END
 *     )
 * WHERE id = :emailId!
 * RETURNING id, status, attempts
 * ```
 */
export const markEmailFailed = new PreparedQuery<IMarkEmailFailedParams,IMarkEmailFailedResult>(markEmailFailedIR);


