/** Types generated for queries found in "src/db/query/booking/listBookingsAdmin.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type booking_status = 'awaiting_deposit' | 'cancelled' | 'completed' | 'confirmed' | 'pending_validation';

export type NumberOrString = number | string;

/** 'ListBookingsAdmin' parameters type */
export interface IListBookingsAdminParams {
  artistId?: string | null | void;
  pageLimit: NumberOrString;
  pageOffset: NumberOrString;
  statusFilter?: string | null | void;
}

/** 'ListBookingsAdmin' return type */
export interface IListBookingsAdminResult {
  artist_id: string;
  artist_stage_name: string;
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

/** 'ListBookingsAdmin' query type */
export interface IListBookingsAdminQuery {
  params: IListBookingsAdminParams;
  result: IListBookingsAdminResult;
}

const listBookingsAdminIR: any = {"usedParamSet":{"statusFilter":true,"artistId":true,"pageLimit":true,"pageOffset":true},"params":[{"name":"statusFilter","required":false,"transform":{"type":"scalar"},"locs":[{"a":395,"b":407},{"a":443,"b":455}]},{"name":"artistId","required":false,"transform":{"type":"scalar"},"locs":[{"a":471,"b":479},{"a":512,"b":520}]},{"name":"pageLimit","required":true,"transform":{"type":"scalar"},"locs":[{"a":562,"b":572}]},{"name":"pageOffset","required":true,"transform":{"type":"scalar"},"locs":[{"a":581,"b":592}]}],"statement":"SELECT\n  b.id, b.artist_id, a.stage_name AS artist_stage_name,\n  ca.email AS client_email,\n  ca.display_name AS client_name,\n  b.event_date, b.event_duration_hours,\n  b.event_location_address, b.quoted_total_cents, b.deposit_amount_cents,\n  b.status, b.paid_at, b.created_at\nFROM bookings b\nJOIN artists a ON a.id = b.artist_id\nLEFT JOIN client_accounts ca ON ca.id = b.client_account_id\nWHERE (:statusFilter::text IS NULL OR b.status::text = :statusFilter::text)\n  AND (:artistId::uuid IS NULL OR b.artist_id = :artistId::uuid)\nORDER BY b.created_at DESC\nLIMIT :pageLimit!\nOFFSET :pageOffset!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   b.id, b.artist_id, a.stage_name AS artist_stage_name,
 *   ca.email AS client_email,
 *   ca.display_name AS client_name,
 *   b.event_date, b.event_duration_hours,
 *   b.event_location_address, b.quoted_total_cents, b.deposit_amount_cents,
 *   b.status, b.paid_at, b.created_at
 * FROM bookings b
 * JOIN artists a ON a.id = b.artist_id
 * LEFT JOIN client_accounts ca ON ca.id = b.client_account_id
 * WHERE (:statusFilter::text IS NULL OR b.status::text = :statusFilter::text)
 *   AND (:artistId::uuid IS NULL OR b.artist_id = :artistId::uuid)
 * ORDER BY b.created_at DESC
 * LIMIT :pageLimit!
 * OFFSET :pageOffset!
 * ```
 */
export const listBookingsAdmin = new PreparedQuery<IListBookingsAdminParams,IListBookingsAdminResult>(listBookingsAdminIR);


