/** Types generated for queries found in "src/db/query/booking/listBookingsOverlapping.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type booking_status = 'awaiting_deposit' | 'cancelled' | 'completed' | 'confirmed' | 'pending_validation';

export type DateOrString = Date | string;

/** 'ListBookingsOverlapping' parameters type */
export interface IListBookingsOverlappingParams {
  artistId: string;
  rangeEnd: DateOrString;
  rangeStart: DateOrString;
}

/** 'ListBookingsOverlapping' return type */
export interface IListBookingsOverlappingResult {
  event_date: Date;
  event_duration_hours: string;
  id: string;
  status: booking_status;
}

/** 'ListBookingsOverlapping' query type */
export interface IListBookingsOverlappingQuery {
  params: IListBookingsOverlappingParams;
  result: IListBookingsOverlappingResult;
}

const listBookingsOverlappingIR: any = {"usedParamSet":{"artistId":true,"rangeStart":true,"rangeEnd":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":84,"b":93}]},{"name":"rangeStart","required":true,"transform":{"type":"scalar"},"locs":[{"a":279,"b":290}]},{"name":"rangeEnd","required":true,"transform":{"type":"scalar"},"locs":[{"a":293,"b":302}]}],"statement":"SELECT id, event_date, event_duration_hours, status\nFROM bookings\nWHERE artist_id = :artistId!\n  AND status IN ('confirmed', 'awaiting_deposit', 'pending_validation')\n  AND tstzrange(event_date, event_date + (event_duration_hours || ' hours')::interval, '[)')\n      && tstzrange(:rangeStart!, :rangeEnd!, '[)')"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, event_date, event_duration_hours, status
 * FROM bookings
 * WHERE artist_id = :artistId!
 *   AND status IN ('confirmed', 'awaiting_deposit', 'pending_validation')
 *   AND tstzrange(event_date, event_date + (event_duration_hours || ' hours')::interval, '[)')
 *       && tstzrange(:rangeStart!, :rangeEnd!, '[)')
 * ```
 */
export const listBookingsOverlapping = new PreparedQuery<IListBookingsOverlappingParams,IListBookingsOverlappingResult>(listBookingsOverlappingIR);


