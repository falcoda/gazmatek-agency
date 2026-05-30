/** Types generated for queries found in "src/db/query/contract/touchContractReminder.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'TouchContractReminder' parameters type */
export interface ITouchContractReminderParams {
  contractId: string;
}

/** 'TouchContractReminder' return type */
export interface ITouchContractReminderResult {
  id: string;
  last_reminder_at: Date | null;
}

/** 'TouchContractReminder' query type */
export interface ITouchContractReminderQuery {
  params: ITouchContractReminderParams;
  result: ITouchContractReminderResult;
}

const touchContractReminderIR: any = {"usedParamSet":{"contractId":true},"params":[{"name":"contractId","required":true,"transform":{"type":"scalar"},"locs":[{"a":81,"b":92}]}],"statement":"UPDATE contracts\nSET last_reminder_at = NOW(),\n    updated_at = NOW()\nWHERE id = :contractId!\n  AND (last_reminder_at IS NULL OR last_reminder_at < NOW() - INTERVAL '24 hours')\nRETURNING id, last_reminder_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE contracts
 * SET last_reminder_at = NOW(),
 *     updated_at = NOW()
 * WHERE id = :contractId!
 *   AND (last_reminder_at IS NULL OR last_reminder_at < NOW() - INTERVAL '24 hours')
 * RETURNING id, last_reminder_at
 * ```
 */
export const touchContractReminder = new PreparedQuery<ITouchContractReminderParams,ITouchContractReminderResult>(touchContractReminderIR);


