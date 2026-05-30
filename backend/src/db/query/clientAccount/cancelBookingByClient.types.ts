/** Types generated for queries found in "src/db/query/clientAccount/cancelBookingByClient.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type booking_status = 'awaiting_deposit' | 'cancelled' | 'completed' | 'confirmed' | 'pending_validation';

/** 'CancelBookingByClient' parameters type */
export interface ICancelBookingByClientParams {
  bookingId: string;
  clientId: string;
  minLeadHours: number;
  reason: string;
}

/** 'CancelBookingByClient' return type */
export interface ICancelBookingByClientResult {
  cancel_reason: string | null;
  id: string;
  status: booking_status;
}

/** 'CancelBookingByClient' query type */
export interface ICancelBookingByClientQuery {
  params: ICancelBookingByClientParams;
  result: ICancelBookingByClientResult;
}

const cancelBookingByClientIR: any = {"usedParamSet":{"reason":true,"bookingId":true,"clientId":true,"minLeadHours":true},"params":[{"name":"reason","required":true,"transform":{"type":"scalar"},"locs":[{"a":482,"b":489}]},{"name":"bookingId","required":true,"transform":{"type":"scalar"},"locs":[{"a":526,"b":536}]},{"name":"clientId","required":true,"transform":{"type":"scalar"},"locs":[{"a":564,"b":573}]},{"name":"minLeadHours","required":true,"transform":{"type":"scalar"},"locs":[{"a":697,"b":710}]}],"statement":"-- Client cancels their own booking. The WHERE clause enforces three things at\n-- once so a stale read from the dashboard can never cancel a booking the\n-- client no longer owns, an already-terminal booking, or one too close to its\n-- event date. `client_account_id` is the ownership guard; the IN clause keeps\n-- terminal statuses (`cancelled`, `completed`) out; the interval check blocks\n-- last-minute cancellations.\nUPDATE bookings\nSET status = 'cancelled',\n    cancel_reason = :reason!,\n    updated_at = NOW()\nWHERE id = :bookingId!\n  AND client_account_id = :clientId!\n  AND status IN ('pending_validation', 'awaiting_deposit', 'confirmed')\n  AND event_date > NOW() + make_interval(hours => :minLeadHours!)\nRETURNING id, status, cancel_reason"};

/**
 * Query generated from SQL:
 * ```
 * -- Client cancels their own booking. The WHERE clause enforces three things at
 * -- once so a stale read from the dashboard can never cancel a booking the
 * -- client no longer owns, an already-terminal booking, or one too close to its
 * -- event date. `client_account_id` is the ownership guard; the IN clause keeps
 * -- terminal statuses (`cancelled`, `completed`) out; the interval check blocks
 * -- last-minute cancellations.
 * UPDATE bookings
 * SET status = 'cancelled',
 *     cancel_reason = :reason!,
 *     updated_at = NOW()
 * WHERE id = :bookingId!
 *   AND client_account_id = :clientId!
 *   AND status IN ('pending_validation', 'awaiting_deposit', 'confirmed')
 *   AND event_date > NOW() + make_interval(hours => :minLeadHours!)
 * RETURNING id, status, cancel_reason
 * ```
 */
export const cancelBookingByClient = new PreparedQuery<ICancelBookingByClientParams,ICancelBookingByClientResult>(cancelBookingByClientIR);


