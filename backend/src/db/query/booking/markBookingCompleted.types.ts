/** Types generated for queries found in "src/db/query/booking/markBookingCompleted.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type booking_status = 'awaiting_deposit' | 'cancelled' | 'completed' | 'confirmed' | 'pending_validation';

/** 'MarkBookingCompleted' parameters type */
export interface IMarkBookingCompletedParams {
  bookingId: string;
}

/** 'MarkBookingCompleted' return type */
export interface IMarkBookingCompletedResult {
  id: string;
  paid_at: Date | null;
  status: booking_status;
}

/** 'MarkBookingCompleted' query type */
export interface IMarkBookingCompletedQuery {
  params: IMarkBookingCompletedParams;
  result: IMarkBookingCompletedResult;
}

const markBookingCompletedIR: any = {"usedParamSet":{"bookingId":true},"params":[{"name":"bookingId","required":true,"transform":{"type":"scalar"},"locs":[{"a":255,"b":265}]}],"statement":"-- Admin marks the booking as fully paid + done after the event. We also stamp\n-- `paid_at` because at this point the balance has been received off-platform.\nUPDATE bookings\nSET status = 'completed',\n    paid_at = NOW(),\n    updated_at = NOW()\nWHERE id = :bookingId!\n  AND status = 'confirmed'\nRETURNING id, status, paid_at"};

/**
 * Query generated from SQL:
 * ```
 * -- Admin marks the booking as fully paid + done after the event. We also stamp
 * -- `paid_at` because at this point the balance has been received off-platform.
 * UPDATE bookings
 * SET status = 'completed',
 *     paid_at = NOW(),
 *     updated_at = NOW()
 * WHERE id = :bookingId!
 *   AND status = 'confirmed'
 * RETURNING id, status, paid_at
 * ```
 */
export const markBookingCompleted = new PreparedQuery<IMarkBookingCompletedParams,IMarkBookingCompletedResult>(markBookingCompletedIR);


