/** Types generated for queries found in "src/db/query/email/listFailedEmails.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

/** 'ListFailedEmails' parameters type */
export interface IListFailedEmailsParams {
  pageLimit: NumberOrString;
}

/** 'ListFailedEmails' return type */
export interface IListFailedEmailsResult {
  attempts: number;
  id: string;
  locale: string;
  payload: Json;
  recipient: string;
  template: string;
}

/** 'ListFailedEmails' query type */
export interface IListFailedEmailsQuery {
  params: IListFailedEmailsParams;
  result: IListFailedEmailsResult;
}

const listFailedEmailsIR: any = {"usedParamSet":{"pageLimit":true},"params":[{"name":"pageLimit","required":true,"transform":{"type":"scalar"},"locs":[{"a":166,"b":176}]}],"statement":"SELECT id, template, recipient, locale, payload, attempts\nFROM email_deliveries\nWHERE status = 'failed'\n  AND next_retry_at <= NOW()\nORDER BY next_retry_at ASC\nLIMIT :pageLimit!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, template, recipient, locale, payload, attempts
 * FROM email_deliveries
 * WHERE status = 'failed'
 *   AND next_retry_at <= NOW()
 * ORDER BY next_retry_at ASC
 * LIMIT :pageLimit!
 * ```
 */
export const listFailedEmails = new PreparedQuery<IListFailedEmailsParams,IListFailedEmailsResult>(listFailedEmailsIR);


