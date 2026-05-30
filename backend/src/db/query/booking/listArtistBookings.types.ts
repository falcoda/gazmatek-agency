/** Types generated for queries found in "src/db/query/booking/listArtistBookings.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type booking_status = 'awaiting_deposit' | 'cancelled' | 'completed' | 'confirmed' | 'pending_validation';

export type NumberOrString = number | string;

/** 'ListArtistBookings' parameters type */
export interface IListArtistBookingsParams {
  artistId: string;
  pageLimit: NumberOrString;
  pageOffset: NumberOrString;
  upcoming?: boolean | null | void;
}

/** 'ListArtistBookings' return type */
export interface IListArtistBookingsResult {
  artist_id: string;
  client_email: string | null;
  client_name: string | null;
  created_at: Date;
  deposit_amount_cents: number;
  event_date: Date;
  event_duration_hours: string;
  event_location_address: string;
  id: string;
  paid_at: Date | null;
  quoted_total_cents: number;
  status: booking_status;
}

/** 'ListArtistBookings' query type */
export interface IListArtistBookingsQuery {
  params: IListArtistBookingsParams;
  result: IListArtistBookingsResult;
}

const listArtistBookingsIR: any = {"usedParamSet":{"artistId":true,"upcoming":true,"pageLimit":true,"pageOffset":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":336,"b":345}]},{"name":"upcoming","required":false,"transform":{"type":"scalar"},"locs":[{"a":360,"b":368},{"a":491,"b":499}]},{"name":"pageLimit","required":true,"transform":{"type":"scalar"},"locs":[{"a":635,"b":645}]},{"name":"pageOffset","required":true,"transform":{"type":"scalar"},"locs":[{"a":654,"b":665}]}],"statement":"SELECT\n  b.id, b.artist_id,\n  ca.display_name AS client_name,\n  ca.email AS client_email,\n  b.event_date, b.event_duration_hours,\n  b.event_location_address, b.quoted_total_cents, b.deposit_amount_cents,\n  b.status, b.paid_at, b.created_at\nFROM bookings b\nLEFT JOIN client_accounts ca ON ca.id = b.client_account_id\nWHERE b.artist_id = :artistId!\n  AND (\n    (:upcoming::boolean = TRUE AND b.event_date >= NOW() AND b.status IN ('confirmed','awaiting_deposit','pending_validation'))\n    OR (:upcoming::boolean = FALSE AND (b.event_date < NOW() OR b.status = 'completed' OR b.status = 'cancelled'))\n  )\nORDER BY b.event_date DESC\nLIMIT :pageLimit!\nOFFSET :pageOffset!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   b.id, b.artist_id,
 *   ca.display_name AS client_name,
 *   ca.email AS client_email,
 *   b.event_date, b.event_duration_hours,
 *   b.event_location_address, b.quoted_total_cents, b.deposit_amount_cents,
 *   b.status, b.paid_at, b.created_at
 * FROM bookings b
 * LEFT JOIN client_accounts ca ON ca.id = b.client_account_id
 * WHERE b.artist_id = :artistId!
 *   AND (
 *     (:upcoming::boolean = TRUE AND b.event_date >= NOW() AND b.status IN ('confirmed','awaiting_deposit','pending_validation'))
 *     OR (:upcoming::boolean = FALSE AND (b.event_date < NOW() OR b.status = 'completed' OR b.status = 'cancelled'))
 *   )
 * ORDER BY b.event_date DESC
 * LIMIT :pageLimit!
 * OFFSET :pageOffset!
 * ```
 */
export const listArtistBookings = new PreparedQuery<IListArtistBookingsParams,IListArtistBookingsResult>(listArtistBookingsIR);


