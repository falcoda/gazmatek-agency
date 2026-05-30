/** Types generated for queries found in "src/db/query/clientAccount/listBookingsByClient.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type booking_status = 'awaiting_deposit' | 'cancelled' | 'completed' | 'confirmed' | 'pending_validation';

/** 'ListBookingsByClient' parameters type */
export interface IListBookingsByClientParams {
  clientId: string;
}

/** 'ListBookingsByClient' return type */
export interface IListBookingsByClientResult {
  artist_cover_image_url: string | null;
  artist_id: string;
  artist_slug: string;
  artist_stage_name: string;
  created_at: Date;
  event_context: string | null;
  event_date: Date;
  event_duration_hours: string;
  event_location_address: string;
  id: string;
  quoted_total_cents: number;
  status: booking_status;
}

/** 'ListBookingsByClient' query type */
export interface IListBookingsByClientQuery {
  params: IListBookingsByClientParams;
  result: IListBookingsByClientResult;
}

const listBookingsByClientIR: any = {"usedParamSet":{"clientId":true},"params":[{"name":"clientId","required":true,"transform":{"type":"scalar"},"locs":[{"a":391,"b":400}]}],"statement":"SELECT b.id, b.status,\n       b.event_date, b.event_duration_hours,\n       b.event_location_address,\n       b.event_context,\n       b.quoted_total_cents,\n       b.created_at,\n       a.id AS artist_id, a.slug AS artist_slug, a.stage_name AS artist_stage_name,\n       a.cover_image_url AS artist_cover_image_url\nFROM bookings b\nJOIN artists a ON a.id = b.artist_id\nWHERE b.client_account_id = :clientId!\nORDER BY b.event_date DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT b.id, b.status,
 *        b.event_date, b.event_duration_hours,
 *        b.event_location_address,
 *        b.event_context,
 *        b.quoted_total_cents,
 *        b.created_at,
 *        a.id AS artist_id, a.slug AS artist_slug, a.stage_name AS artist_stage_name,
 *        a.cover_image_url AS artist_cover_image_url
 * FROM bookings b
 * JOIN artists a ON a.id = b.artist_id
 * WHERE b.client_account_id = :clientId!
 * ORDER BY b.event_date DESC
 * ```
 */
export const listBookingsByClient = new PreparedQuery<IListBookingsByClientParams,IListBookingsByClientResult>(listBookingsByClientIR);


