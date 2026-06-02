/** Types generated for queries found in "src/db/query/booking/createBooking.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_set_type = 'dj' | 'hybrid' | 'live';

export type booking_status = 'awaiting_deposit' | 'cancelled' | 'completed' | 'confirmed' | 'pending_validation';

export type DateOrString = Date | string;

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

/** 'CreateBooking' parameters type */
export interface ICreateBookingParams {
  adminApprovedAt?: DateOrString | null | void;
  artistId: string;
  capacity: number;
  clientAccountId: string;
  clientLocale: string;
  depositAmountCents: number;
  eventContext?: string | null | void;
  eventDate: DateOrString;
  eventDurationHours: NumberOrString;
  eventLocationAddress: string;
  eventLocationLat?: NumberOrString | null | void;
  eventLocationLng?: NumberOrString | null | void;
  options: Json;
  paidAt?: DateOrString | null | void;
  quotedTotalCents: number;
  setType: artist_set_type;
  status?: string | null | void;
  ticketPriceCents: number;
}

/** 'CreateBooking' return type */
export interface ICreateBookingResult {
  created_at: Date;
  id: string;
  status: booking_status;
}

/** 'CreateBooking' query type */
export interface ICreateBookingQuery {
  params: ICreateBookingParams;
  result: ICreateBookingResult;
}

const createBookingIR: any = {"usedParamSet":{"artistId":true,"clientAccountId":true,"clientLocale":true,"eventDate":true,"eventDurationHours":true,"eventLocationAddress":true,"eventLocationLat":true,"eventLocationLng":true,"eventContext":true,"capacity":true,"ticketPriceCents":true,"setType":true,"options":true,"quotedTotalCents":true,"depositAmountCents":true,"status":true,"adminApprovedAt":true,"paidAt":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":609,"b":618}]},{"name":"clientAccountId","required":true,"transform":{"type":"scalar"},"locs":[{"a":621,"b":637}]},{"name":"clientLocale","required":true,"transform":{"type":"scalar"},"locs":[{"a":642,"b":655}]},{"name":"eventDate","required":true,"transform":{"type":"scalar"},"locs":[{"a":660,"b":670}]},{"name":"eventDurationHours","required":true,"transform":{"type":"scalar"},"locs":[{"a":673,"b":692}]},{"name":"eventLocationAddress","required":true,"transform":{"type":"scalar"},"locs":[{"a":695,"b":716}]},{"name":"eventLocationLat","required":false,"transform":{"type":"scalar"},"locs":[{"a":721,"b":737}]},{"name":"eventLocationLng","required":false,"transform":{"type":"scalar"},"locs":[{"a":740,"b":756}]},{"name":"eventContext","required":false,"transform":{"type":"scalar"},"locs":[{"a":759,"b":771}]},{"name":"capacity","required":true,"transform":{"type":"scalar"},"locs":[{"a":776,"b":785}]},{"name":"ticketPriceCents","required":true,"transform":{"type":"scalar"},"locs":[{"a":788,"b":805}]},{"name":"setType","required":true,"transform":{"type":"scalar"},"locs":[{"a":808,"b":816}]},{"name":"options","required":true,"transform":{"type":"scalar"},"locs":[{"a":838,"b":846}]},{"name":"quotedTotalCents","required":true,"transform":{"type":"scalar"},"locs":[{"a":851,"b":868}]},{"name":"depositAmountCents","required":true,"transform":{"type":"scalar"},"locs":[{"a":871,"b":890}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":904,"b":910}]},{"name":"adminApprovedAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":954,"b":969}]},{"name":"paidAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":972,"b":978}]}],"statement":"-- Public bookings land in `pending_validation` so an admin can manually review\n-- before transitioning the booking to `awaiting_deposit`, `confirmed`, etc.\n-- All payment tracking is done by the admin off-platform; there is no Stripe\n-- (or any automated) payment step.\nINSERT INTO bookings (\n  artist_id, client_account_id,\n  client_locale,\n  event_date, event_duration_hours, event_location_address,\n  event_location_lat, event_location_lng, event_context,\n  capacity, ticket_price_cents, set_type,\n  options,\n  quoted_total_cents, deposit_amount_cents,\n  status,\n  admin_approved_at, paid_at\n)\nVALUES (\n  :artistId!, :clientAccountId!,\n  :clientLocale!,\n  :eventDate!, :eventDurationHours!, :eventLocationAddress!,\n  :eventLocationLat, :eventLocationLng, :eventContext,\n  :capacity!, :ticketPriceCents!, :setType!::artist_set_type,\n  :options!,\n  :quotedTotalCents!, :depositAmountCents!,\n  COALESCE(:status, 'pending_validation')::booking_status,\n  :adminApprovedAt, :paidAt\n)\nRETURNING id, status, created_at"};

/**
 * Query generated from SQL:
 * ```
 * -- Public bookings land in `pending_validation` so an admin can manually review
 * -- before transitioning the booking to `awaiting_deposit`, `confirmed`, etc.
 * -- All payment tracking is done by the admin off-platform; there is no Stripe
 * -- (or any automated) payment step.
 * INSERT INTO bookings (
 *   artist_id, client_account_id,
 *   client_locale,
 *   event_date, event_duration_hours, event_location_address,
 *   event_location_lat, event_location_lng, event_context,
 *   capacity, ticket_price_cents, set_type,
 *   options,
 *   quoted_total_cents, deposit_amount_cents,
 *   status,
 *   admin_approved_at, paid_at
 * )
 * VALUES (
 *   :artistId!, :clientAccountId!,
 *   :clientLocale!,
 *   :eventDate!, :eventDurationHours!, :eventLocationAddress!,
 *   :eventLocationLat, :eventLocationLng, :eventContext,
 *   :capacity!, :ticketPriceCents!, :setType!::artist_set_type,
 *   :options!,
 *   :quotedTotalCents!, :depositAmountCents!,
 *   COALESCE(:status, 'pending_validation')::booking_status,
 *   :adminApprovedAt, :paidAt
 * )
 * RETURNING id, status, created_at
 * ```
 */
export const createBooking = new PreparedQuery<ICreateBookingParams,ICreateBookingResult>(createBookingIR);


