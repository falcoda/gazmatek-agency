/** Types generated for queries found in "src/db/query/booking/rejectBookingAdmin.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type booking_status = 'awaiting_deposit' | 'cancelled' | 'completed' | 'confirmed' | 'pending_validation';

/** 'RejectBookingAdmin' parameters type */
export interface IRejectBookingAdminParams {
  bookingId: string;
  reason: string;
}

/** 'RejectBookingAdmin' return type */
export interface IRejectBookingAdminResult {
  cancel_reason: string | null;
  id: string;
  status: booking_status;
}

/** 'RejectBookingAdmin' query type */
export interface IRejectBookingAdminQuery {
  params: IRejectBookingAdminParams;
  result: IRejectBookingAdminResult;
}

const rejectBookingAdminIR: any = {"usedParamSet":{"reason":true,"bookingId":true},"params":[{"name":"reason","required":true,"transform":{"type":"scalar"},"locs":[{"a":373,"b":380}]},{"name":"bookingId","required":true,"transform":{"type":"scalar"},"locs":[{"a":417,"b":427}]}],"statement":"-- Admin rejects/cancels a booking. Allowed from any non-terminal state:\n-- a freshly-submitted request (`pending_validation`), one awaiting its deposit\n-- (`awaiting_deposit`), or an already-confirmed booking that has to be called\n-- off (event cancelled, force majeure, client backing out after the deposit).\nUPDATE bookings\nSET status = 'cancelled',\n    cancel_reason = :reason!,\n    updated_at = NOW()\nWHERE id = :bookingId!\n  AND status IN ('pending_validation', 'awaiting_deposit', 'confirmed')\nRETURNING id, status, cancel_reason"};

/**
 * Query generated from SQL:
 * ```
 * -- Admin rejects/cancels a booking. Allowed from any non-terminal state:
 * -- a freshly-submitted request (`pending_validation`), one awaiting its deposit
 * -- (`awaiting_deposit`), or an already-confirmed booking that has to be called
 * -- off (event cancelled, force majeure, client backing out after the deposit).
 * UPDATE bookings
 * SET status = 'cancelled',
 *     cancel_reason = :reason!,
 *     updated_at = NOW()
 * WHERE id = :bookingId!
 *   AND status IN ('pending_validation', 'awaiting_deposit', 'confirmed')
 * RETURNING id, status, cancel_reason
 * ```
 */
export const rejectBookingAdmin = new PreparedQuery<IRejectBookingAdminParams,IRejectBookingAdminResult>(rejectBookingAdminIR);


