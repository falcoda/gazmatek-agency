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

const listArtistBookingsIR: any = {"usedParamSet":{"artistId":true,"upcoming":true,"pageLimit":true,"pageOffset":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":710,"b":719}]},{"name":"upcoming","required":false,"transform":{"type":"scalar"},"locs":[{"a":734,"b":742},{"a":865,"b":873}]},{"name":"pageLimit","required":true,"transform":{"type":"scalar"},"locs":[{"a":1009,"b":1019}]},{"name":"pageOffset","required":true,"transform":{"type":"scalar"},"locs":[{"a":1028,"b":1039}]}],"statement":"-- RGPD masking (#48): the client's display name is only revealed once the\n-- booking is confirmed or completed — same rule getBookingDetail applies. Before\n-- that, the artist sees the slot but not who the client is.\nSELECT\n  b.id, b.artist_id,\n  CASE\n    WHEN b.status IN ('confirmed', 'completed') THEN ca.display_name\n    ELSE NULL\n  END AS client_name,\n  CASE\n    WHEN b.status IN ('confirmed', 'completed') THEN ca.email\n    ELSE NULL\n  END AS client_email,\n  b.event_date, b.event_duration_hours,\n  b.event_location_address, b.quoted_total_cents, b.deposit_amount_cents,\n  b.status, b.paid_at, b.created_at\nFROM bookings b\nLEFT JOIN client_accounts ca ON ca.id = b.client_account_id\nWHERE b.artist_id = :artistId!\n  AND (\n    (:upcoming::boolean = TRUE AND b.event_date >= NOW() AND b.status IN ('confirmed','awaiting_deposit','pending_validation'))\n    OR (:upcoming::boolean = FALSE AND (b.event_date < NOW() OR b.status = 'completed' OR b.status = 'cancelled'))\n  )\nORDER BY b.event_date DESC\nLIMIT :pageLimit!\nOFFSET :pageOffset!"};

/**
 * Query generated from SQL:
 * ```
 * -- RGPD masking (#48): the client's display name is only revealed once the
 * -- booking is confirmed or completed — same rule getBookingDetail applies. Before
 * -- that, the artist sees the slot but not who the client is.
 * SELECT
 *   b.id, b.artist_id,
 *   CASE
 *     WHEN b.status IN ('confirmed', 'completed') THEN ca.display_name
 *     ELSE NULL
 *   END AS client_name,
 *   CASE
 *     WHEN b.status IN ('confirmed', 'completed') THEN ca.email
 *     ELSE NULL
 *   END AS client_email,
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


