/** Types generated for queries found in "src/db/query/booking/getBookingById.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_set_type = 'dj' | 'hybrid' | 'live';

export type booking_status = 'awaiting_deposit' | 'cancelled' | 'completed' | 'confirmed' | 'pending_validation';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetBookingById' parameters type */
export interface IGetBookingByIdParams {
  bookingId: string;
}

/** 'GetBookingById' return type */
export interface IGetBookingByIdResult {
  admin_approved_at: Date | null;
  artist_id: string;
  artist_slug: string;
  artist_stage_name: string;
  cancel_reason: string | null;
  capacity: number;
  client_account_email: string | null;
  client_account_id: string | null;
  client_claimed_at: Date | null;
  client_email: string | null;
  client_locale: string;
  client_name: string | null;
  client_phone: string | null;
  created_at: Date;
  deposit_amount_cents: number;
  event_context: string | null;
  event_date: Date;
  event_duration_hours: string;
  event_location_address: string;
  event_location_lat: string | null;
  event_location_lng: string | null;
  id: string;
  options: Json;
  paid_at: Date | null;
  quoted_total_cents: number;
  set_type: artist_set_type;
  status: booking_status;
  ticket_price_cents: number;
  updated_at: Date;
  validated_at: Date | null;
}

/** 'GetBookingById' query type */
export interface IGetBookingByIdQuery {
  params: IGetBookingByIdParams;
  result: IGetBookingByIdResult;
}

const getBookingByIdIR: any = {"usedParamSet":{"bookingId":true},"params":[{"name":"bookingId","required":true,"transform":{"type":"scalar"},"locs":[{"a":766,"b":776}]}],"statement":"SELECT\n  b.id, b.artist_id,\n  b.client_account_id,\n  ca.email AS client_email,\n  ca.display_name AS client_name,\n  ca.phone AS client_phone,\n  b.client_locale,\n  b.event_date, b.event_duration_hours, b.event_location_address,\n  b.event_location_lat, b.event_location_lng, b.event_context,\n  b.capacity, b.ticket_price_cents, b.set_type,\n  b.options,\n  b.quoted_total_cents, b.deposit_amount_cents,\n  b.status, b.admin_approved_at, b.validated_at,\n  b.cancel_reason, b.paid_at,\n  b.created_at, b.updated_at,\n  a.slug AS artist_slug, a.stage_name AS artist_stage_name,\n  ca.claimed_at AS client_claimed_at,\n  ca.email AS client_account_email\nFROM bookings b\nJOIN artists a ON a.id = b.artist_id\nLEFT JOIN client_accounts ca ON ca.id = b.client_account_id\nWHERE b.id = :bookingId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   b.id, b.artist_id,
 *   b.client_account_id,
 *   ca.email AS client_email,
 *   ca.display_name AS client_name,
 *   ca.phone AS client_phone,
 *   b.client_locale,
 *   b.event_date, b.event_duration_hours, b.event_location_address,
 *   b.event_location_lat, b.event_location_lng, b.event_context,
 *   b.capacity, b.ticket_price_cents, b.set_type,
 *   b.options,
 *   b.quoted_total_cents, b.deposit_amount_cents,
 *   b.status, b.admin_approved_at, b.validated_at,
 *   b.cancel_reason, b.paid_at,
 *   b.created_at, b.updated_at,
 *   a.slug AS artist_slug, a.stage_name AS artist_stage_name,
 *   ca.claimed_at AS client_claimed_at,
 *   ca.email AS client_account_email
 * FROM bookings b
 * JOIN artists a ON a.id = b.artist_id
 * LEFT JOIN client_accounts ca ON ca.id = b.client_account_id
 * WHERE b.id = :bookingId!
 * ```
 */
export const getBookingById = new PreparedQuery<IGetBookingByIdParams,IGetBookingByIdResult>(getBookingByIdIR);


