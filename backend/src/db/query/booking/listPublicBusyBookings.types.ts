/** Types generated for queries found in "src/db/query/booking/listPublicBusyBookings.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type booking_status = 'awaiting_deposit' | 'cancelled' | 'completed' | 'confirmed' | 'pending_validation';

export type DateOrString = Date | string;

/** 'ListPublicBusyBookings' parameters type */
export interface IListPublicBusyBookingsParams {
  artistId: string;
  rangeEnd: DateOrString;
  rangeStart: DateOrString;
}

/** 'ListPublicBusyBookings' return type */
export interface IListPublicBusyBookingsResult {
  event_date: Date;
  event_duration_hours: string;
  id: string;
  status: booking_status;
}

/** 'ListPublicBusyBookings' query type */
export interface IListPublicBusyBookingsQuery {
  params: IListPublicBusyBookingsParams;
  result: IListPublicBusyBookingsResult;
}

const listPublicBusyBookingsIR: any = {"usedParamSet":{"artistId":true,"rangeStart":true,"rangeEnd":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":375,"b":384}]},{"name":"rangeStart","required":true,"transform":{"type":"scalar"},"locs":[{"a":548,"b":559}]},{"name":"rangeEnd","required":true,"transform":{"type":"scalar"},"locs":[{"a":562,"b":571}]}],"statement":"-- Narrower counterpart of listBookingsOverlapping for the PUBLIC availability\n-- calendar (#17). It deliberately excludes `pending_validation` so unreviewed\n-- requests are never disclosed through the public calendar. Only confirmed and\n-- awaiting_deposit bookings mark a public day busy.\nSELECT id, event_date, event_duration_hours, status\nFROM bookings\nWHERE artist_id = :artistId!\n  AND status IN ('confirmed', 'awaiting_deposit')\n  AND tstzrange(event_date, event_date + (event_duration_hours || ' hours')::interval, '[)')\n      && tstzrange(:rangeStart!, :rangeEnd!, '[)')"};

/**
 * Query generated from SQL:
 * ```
 * -- Narrower counterpart of listBookingsOverlapping for the PUBLIC availability
 * -- calendar (#17). It deliberately excludes `pending_validation` so unreviewed
 * -- requests are never disclosed through the public calendar. Only confirmed and
 * -- awaiting_deposit bookings mark a public day busy.
 * SELECT id, event_date, event_duration_hours, status
 * FROM bookings
 * WHERE artist_id = :artistId!
 *   AND status IN ('confirmed', 'awaiting_deposit')
 *   AND tstzrange(event_date, event_date + (event_duration_hours || ' hours')::interval, '[)')
 *       && tstzrange(:rangeStart!, :rangeEnd!, '[)')
 * ```
 */
export const listPublicBusyBookings = new PreparedQuery<IListPublicBusyBookingsParams,IListPublicBusyBookingsResult>(listPublicBusyBookingsIR);


