/** Types generated for queries found in "src/db/query/artistAdmin/countArtistActiveBookings.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CountArtistActiveBookings' parameters type */
export interface ICountArtistActiveBookingsParams {
  artistId: string;
}

/** 'CountArtistActiveBookings' return type */
export interface ICountArtistActiveBookingsResult {
  total: number | null;
}

/** 'CountArtistActiveBookings' query type */
export interface ICountArtistActiveBookingsQuery {
  params: ICountArtistActiveBookingsParams;
  result: ICountArtistActiveBookingsResult;
}

const countArtistActiveBookingsIR: any = {"usedParamSet":{"artistId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":62,"b":71}]}],"statement":"SELECT COUNT(*)::int AS total\nFROM bookings\nWHERE artist_id = :artistId!\n  AND status IN ('pending_validation', 'awaiting_deposit', 'confirmed')"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT(*)::int AS total
 * FROM bookings
 * WHERE artist_id = :artistId!
 *   AND status IN ('pending_validation', 'awaiting_deposit', 'confirmed')
 * ```
 */
export const countArtistActiveBookings = new PreparedQuery<ICountArtistActiveBookingsParams,ICountArtistActiveBookingsResult>(countArtistActiveBookingsIR);


