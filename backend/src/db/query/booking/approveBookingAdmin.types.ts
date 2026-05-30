/** Types generated for queries found in "src/db/query/booking/approveBookingAdmin.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type booking_status = 'awaiting_deposit' | 'cancelled' | 'completed' | 'confirmed' | 'pending_validation';

/** 'ApproveBookingAdmin' parameters type */
export interface IApproveBookingAdminParams {
  bookingId: string;
}

/** 'ApproveBookingAdmin' return type */
export interface IApproveBookingAdminResult {
  admin_approved_at: Date | null;
  id: string;
  status: booking_status;
}

/** 'ApproveBookingAdmin' query type */
export interface IApproveBookingAdminQuery {
  params: IApproveBookingAdminParams;
  result: IApproveBookingAdminResult;
}

const approveBookingAdminIR: any = {"usedParamSet":{"bookingId":true},"params":[{"name":"bookingId","required":true,"transform":{"type":"scalar"},"locs":[{"a":369,"b":379}]}],"statement":"-- Admin approves a freshly-submitted booking. The booking moves from\n-- `pending_validation` to `awaiting_deposit`: the agency is now waiting for\n-- the client to wire the deposit, which the admin will manually mark paid\n-- via `markBookingDepositPaid`.\nUPDATE bookings\nSET admin_approved_at = NOW(),\n    status = 'awaiting_deposit',\n    updated_at = NOW()\nWHERE id = :bookingId!\n  AND status = 'pending_validation'\n  AND admin_approved_at IS NULL\nRETURNING id, status, admin_approved_at"};

/**
 * Query generated from SQL:
 * ```
 * -- Admin approves a freshly-submitted booking. The booking moves from
 * -- `pending_validation` to `awaiting_deposit`: the agency is now waiting for
 * -- the client to wire the deposit, which the admin will manually mark paid
 * -- via `markBookingDepositPaid`.
 * UPDATE bookings
 * SET admin_approved_at = NOW(),
 *     status = 'awaiting_deposit',
 *     updated_at = NOW()
 * WHERE id = :bookingId!
 *   AND status = 'pending_validation'
 *   AND admin_approved_at IS NULL
 * RETURNING id, status, admin_approved_at
 * ```
 */
export const approveBookingAdmin = new PreparedQuery<IApproveBookingAdminParams,IApproveBookingAdminResult>(approveBookingAdminIR);


