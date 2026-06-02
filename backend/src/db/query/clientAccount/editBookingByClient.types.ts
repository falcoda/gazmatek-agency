/** Types generated for queries found in "src/db/query/clientAccount/editBookingByClient.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type booking_status = 'awaiting_deposit' | 'cancelled' | 'completed' | 'confirmed' | 'pending_validation';

export type DateOrString = Date | string;

export type NumberOrString = number | string;

/** 'EditBookingByClient' parameters type */
export interface IEditBookingByClientParams {
  bookingId: string;
  capacity?: number | null | void;
  clientId: string;
  eventContext?: string | null | void;
  eventDate?: DateOrString | null | void;
  eventDurationHours?: NumberOrString | null | void;
  eventLocationAddress?: string | null | void;
  eventLocationLat?: NumberOrString | null | void;
  eventLocationLng?: NumberOrString | null | void;
  ticketPriceCents?: number | null | void;
}

/** 'EditBookingByClient' return type */
export interface IEditBookingByClientResult {
  capacity: number;
  created_at: Date;
  event_context: string | null;
  event_date: Date;
  event_duration_hours: string;
  event_location_address: string;
  id: string;
  quoted_total_cents: number;
  status: booking_status;
  ticket_price_cents: number;
}

/** 'EditBookingByClient' query type */
export interface IEditBookingByClientQuery {
  params: IEditBookingByClientParams;
  result: IEditBookingByClientResult;
}

const editBookingByClientIR: any = {"usedParamSet":{"eventDate":true,"eventDurationHours":true,"eventLocationAddress":true,"eventLocationLat":true,"eventLocationLng":true,"eventContext":true,"capacity":true,"ticketPriceCents":true,"bookingId":true,"clientId":true},"params":[{"name":"eventDate","required":false,"transform":{"type":"scalar"},"locs":[{"a":488,"b":497}]},{"name":"eventDurationHours","required":false,"transform":{"type":"scalar"},"locs":[{"a":549,"b":567}]},{"name":"eventLocationAddress","required":false,"transform":{"type":"scalar"},"locs":[{"a":631,"b":651}]},{"name":"eventLocationLat","required":false,"transform":{"type":"scalar"},"locs":[{"a":713,"b":729}]},{"name":"eventLocationLng","required":false,"transform":{"type":"scalar"},"locs":[{"a":787,"b":803}]},{"name":"eventContext","required":false,"transform":{"type":"scalar"},"locs":[{"a":856,"b":868}]},{"name":"capacity","required":false,"transform":{"type":"scalar"},"locs":[{"a":911,"b":919}]},{"name":"ticketPriceCents","required":false,"transform":{"type":"scalar"},"locs":[{"a":967,"b":983}]},{"name":"bookingId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1041,"b":1051}]},{"name":"clientId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1079,"b":1088}]}],"statement":"-- #30 Client edits their own booking. Like cancelBookingByClient, the WHERE\n-- clause enforces ownership and the allowed status atomically: only a booking\n-- the client owns AND still in `pending_validation` can be edited. Editable\n-- fields use COALESCE so an absent field is left untouched. event_date/duration\n-- changes are guarded against the active-booking overlap by the EXCLUDE\n-- constraint (#5), surfaced as a conflict by the service.\nUPDATE bookings\nSET event_date = COALESCE(:eventDate, event_date),\n    event_duration_hours = COALESCE(:eventDurationHours, event_duration_hours),\n    event_location_address = COALESCE(:eventLocationAddress, event_location_address),\n    event_location_lat = COALESCE(:eventLocationLat, event_location_lat),\n    event_location_lng = COALESCE(:eventLocationLng, event_location_lng),\n    event_context = COALESCE(:eventContext, event_context),\n    capacity = COALESCE(:capacity, capacity),\n    ticket_price_cents = COALESCE(:ticketPriceCents, ticket_price_cents),\n    updated_at = NOW()\nWHERE id = :bookingId!\n  AND client_account_id = :clientId!\n  AND status = 'pending_validation'\nRETURNING id, status, event_date, event_duration_hours,\n          event_location_address, event_context, capacity,\n          ticket_price_cents, quoted_total_cents, created_at"};

/**
 * Query generated from SQL:
 * ```
 * -- #30 Client edits their own booking. Like cancelBookingByClient, the WHERE
 * -- clause enforces ownership and the allowed status atomically: only a booking
 * -- the client owns AND still in `pending_validation` can be edited. Editable
 * -- fields use COALESCE so an absent field is left untouched. event_date/duration
 * -- changes are guarded against the active-booking overlap by the EXCLUDE
 * -- constraint (#5), surfaced as a conflict by the service.
 * UPDATE bookings
 * SET event_date = COALESCE(:eventDate, event_date),
 *     event_duration_hours = COALESCE(:eventDurationHours, event_duration_hours),
 *     event_location_address = COALESCE(:eventLocationAddress, event_location_address),
 *     event_location_lat = COALESCE(:eventLocationLat, event_location_lat),
 *     event_location_lng = COALESCE(:eventLocationLng, event_location_lng),
 *     event_context = COALESCE(:eventContext, event_context),
 *     capacity = COALESCE(:capacity, capacity),
 *     ticket_price_cents = COALESCE(:ticketPriceCents, ticket_price_cents),
 *     updated_at = NOW()
 * WHERE id = :bookingId!
 *   AND client_account_id = :clientId!
 *   AND status = 'pending_validation'
 * RETURNING id, status, event_date, event_duration_hours,
 *           event_location_address, event_context, capacity,
 *           ticket_price_cents, quoted_total_cents, created_at
 * ```
 */
export const editBookingByClient = new PreparedQuery<IEditBookingByClientParams,IEditBookingByClientResult>(editBookingByClientIR);


