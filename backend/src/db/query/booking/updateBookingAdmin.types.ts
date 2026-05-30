/** Types generated for queries found in "src/db/query/booking/updateBookingAdmin.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type booking_status = 'awaiting_deposit' | 'cancelled' | 'completed' | 'confirmed' | 'pending_validation';

export type DateOrString = Date | string;

export type NumberOrString = number | string;

/** 'UpdateBookingAdmin' parameters type */
export interface IUpdateBookingAdminParams {
  bookingId: string;
  depositAmountCents?: number | null | void;
  eventContext?: string | null | void;
  eventDate?: DateOrString | null | void;
  eventDurationHours?: NumberOrString | null | void;
  eventLocationAddress?: string | null | void;
  quotedTotalCents?: number | null | void;
}

/** 'UpdateBookingAdmin' return type */
export interface IUpdateBookingAdminResult {
  id: string;
  status: booking_status;
  updated_at: Date;
}

/** 'UpdateBookingAdmin' query type */
export interface IUpdateBookingAdminQuery {
  params: IUpdateBookingAdminParams;
  result: IUpdateBookingAdminResult;
}

const updateBookingAdminIR: any = {"usedParamSet":{"eventDate":true,"eventDurationHours":true,"eventLocationAddress":true,"eventContext":true,"quotedTotalCents":true,"depositAmountCents":true,"bookingId":true},"params":[{"name":"eventDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":42,"b":51}]},{"name":"eventDurationHours","required":false,"transform":{"type":"scalar"},"locs":[{"a":103,"b":121}]},{"name":"eventLocationAddress","required":false,"transform":{"type":"scalar"},"locs":[{"a":185,"b":205}]},{"name":"eventContext","required":false,"transform":{"type":"scalar"},"locs":[{"a":262,"b":274}]},{"name":"quotedTotalCents","required":false,"transform":{"type":"scalar"},"locs":[{"a":327,"b":343}]},{"name":"depositAmountCents","required":false,"transform":{"type":"scalar"},"locs":[{"a":403,"b":421}]},{"name":"bookingId","required":true,"transform":{"type":"scalar"},"locs":[{"a":481,"b":491}]}],"statement":"UPDATE bookings\nSET event_date = COALESCE(:eventDate, event_date),\n    event_duration_hours = COALESCE(:eventDurationHours, event_duration_hours),\n    event_location_address = COALESCE(:eventLocationAddress, event_location_address),\n    event_context = COALESCE(:eventContext, event_context),\n    quoted_total_cents = COALESCE(:quotedTotalCents, quoted_total_cents),\n    deposit_amount_cents = COALESCE(:depositAmountCents, deposit_amount_cents),\n    updated_at = NOW()\nWHERE id = :bookingId!\nRETURNING id, status, updated_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE bookings
 * SET event_date = COALESCE(:eventDate, event_date),
 *     event_duration_hours = COALESCE(:eventDurationHours, event_duration_hours),
 *     event_location_address = COALESCE(:eventLocationAddress, event_location_address),
 *     event_context = COALESCE(:eventContext, event_context),
 *     quoted_total_cents = COALESCE(:quotedTotalCents, quoted_total_cents),
 *     deposit_amount_cents = COALESCE(:depositAmountCents, deposit_amount_cents),
 *     updated_at = NOW()
 * WHERE id = :bookingId!
 * RETURNING id, status, updated_at
 * ```
 */
export const updateBookingAdmin = new PreparedQuery<IUpdateBookingAdminParams,IUpdateBookingAdminResult>(updateBookingAdminIR);


