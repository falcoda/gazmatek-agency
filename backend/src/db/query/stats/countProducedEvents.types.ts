/** Types generated for queries found in "src/db/query/stats/countProducedEvents.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CountProducedEvents' parameters type */
export type ICountProducedEventsParams = void;

/** 'CountProducedEvents' return type */
export interface ICountProducedEventsResult {
  total: number | null;
}

/** 'CountProducedEvents' query type */
export interface ICountProducedEventsQuery {
  params: ICountProducedEventsParams;
  result: ICountProducedEventsResult;
}

const countProducedEventsIR: any = {"usedParamSet":{},"params":[],"statement":"-- Bookings that materialized into real produced events: confirmed or completed.\nSELECT COUNT(*)::int AS total\nFROM bookings\nWHERE status IN ('confirmed', 'completed')"};

/**
 * Query generated from SQL:
 * ```
 * -- Bookings that materialized into real produced events: confirmed or completed.
 * SELECT COUNT(*)::int AS total
 * FROM bookings
 * WHERE status IN ('confirmed', 'completed')
 * ```
 */
export const countProducedEvents = new PreparedQuery<ICountProducedEventsParams,ICountProducedEventsResult>(countProducedEventsIR);


