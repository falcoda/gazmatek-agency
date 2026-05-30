/** Types generated for queries found in "src/db/query/email/markEmailSent.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'MarkEmailSent' parameters type */
export interface IMarkEmailSentParams {
  emailId: string;
}

/** 'MarkEmailSent' return type */
export interface IMarkEmailSentResult {
  id: string;
  status: string;
}

/** 'MarkEmailSent' query type */
export interface IMarkEmailSentQuery {
  params: IMarkEmailSentParams;
  result: IMarkEmailSentResult;
}

const markEmailSentIR: any = {"usedParamSet":{"emailId":true},"params":[{"name":"emailId","required":true,"transform":{"type":"scalar"},"locs":[{"a":105,"b":113}]}],"statement":"UPDATE email_deliveries\nSET status = 'sent',\n    sent_at = NOW(),\n    attempts = attempts + 1\nWHERE id = :emailId!\nRETURNING id, status"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE email_deliveries
 * SET status = 'sent',
 *     sent_at = NOW(),
 *     attempts = attempts + 1
 * WHERE id = :emailId!
 * RETURNING id, status
 * ```
 */
export const markEmailSent = new PreparedQuery<IMarkEmailSentParams,IMarkEmailSentResult>(markEmailSentIR);


