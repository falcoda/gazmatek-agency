/** Types generated for queries found in "src/db/query/booking/countBookingsAdmin.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CountBookingsAdmin' parameters type */
export interface ICountBookingsAdminParams {
  artistId?: string | null | void;
  statusFilter?: string | null | void;
}

/** 'CountBookingsAdmin' return type */
export interface ICountBookingsAdminResult {
  total: number | null;
}

/** 'CountBookingsAdmin' query type */
export interface ICountBookingsAdminQuery {
  params: ICountBookingsAdminParams;
  result: ICountBookingsAdminResult;
}

const countBookingsAdminIR: any = {"usedParamSet":{"statusFilter":true,"artistId":true},"params":[{"name":"statusFilter","required":false,"transform":{"type":"scalar"},"locs":[{"a":51,"b":63},{"a":97,"b":109}]},{"name":"artistId","required":false,"transform":{"type":"scalar"},"locs":[{"a":125,"b":133},{"a":164,"b":172}]}],"statement":"SELECT COUNT(*)::int AS total\nFROM bookings\nWHERE (:statusFilter::text IS NULL OR status::text = :statusFilter::text)\n  AND (:artistId::uuid IS NULL OR artist_id = :artistId::uuid)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT(*)::int AS total
 * FROM bookings
 * WHERE (:statusFilter::text IS NULL OR status::text = :statusFilter::text)
 *   AND (:artistId::uuid IS NULL OR artist_id = :artistId::uuid)
 * ```
 */
export const countBookingsAdmin = new PreparedQuery<ICountBookingsAdminParams,ICountBookingsAdminResult>(countBookingsAdminIR);


