/** Types generated for queries found in "src/db/query/booking/markBookingDepositPaid.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type booking_status = 'awaiting_deposit' | 'cancelled' | 'completed' | 'confirmed' | 'pending_validation';

/** 'MarkBookingDepositPaid' parameters type */
export interface IMarkBookingDepositPaidParams {
  bookingId: string;
}

/** 'MarkBookingDepositPaid' return type */
export interface IMarkBookingDepositPaidResult {
  id: string;
  status: booking_status;
}

/** 'MarkBookingDepositPaid' query type */
export interface IMarkBookingDepositPaidQuery {
  params: IMarkBookingDepositPaidParams;
  result: IMarkBookingDepositPaidResult;
}

const markBookingDepositPaidIR: any = {"usedParamSet":{"bookingId":true},"params":[{"name":"bookingId","required":true,"transform":{"type":"scalar"},"locs":[{"a":279,"b":289}]}],"statement":"-- Admin manually confirms that the deposit has been received (bank transfer,\n-- cash, etc.). Booking moves from `awaiting_deposit` to `confirmed`, which\n-- locks the slot and unlocks the contract flow.\nUPDATE bookings\nSET status = 'confirmed',\n    updated_at = NOW()\nWHERE id = :bookingId!\n  AND status = 'awaiting_deposit'\nRETURNING id, status"};

/**
 * Query generated from SQL:
 * ```
 * -- Admin manually confirms that the deposit has been received (bank transfer,
 * -- cash, etc.). Booking moves from `awaiting_deposit` to `confirmed`, which
 * -- locks the slot and unlocks the contract flow.
 * UPDATE bookings
 * SET status = 'confirmed',
 *     updated_at = NOW()
 * WHERE id = :bookingId!
 *   AND status = 'awaiting_deposit'
 * RETURNING id, status
 * ```
 */
export const markBookingDepositPaid = new PreparedQuery<IMarkBookingDepositPaidParams,IMarkBookingDepositPaidResult>(markBookingDepositPaidIR);


