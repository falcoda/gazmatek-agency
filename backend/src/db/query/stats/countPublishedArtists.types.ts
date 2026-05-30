/** Types generated for queries found in "src/db/query/stats/countPublishedArtists.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CountPublishedArtistsStats' parameters type */
export type ICountPublishedArtistsStatsParams = void;

/** 'CountPublishedArtistsStats' return type */
export interface ICountPublishedArtistsStatsResult {
  total: number | null;
}

/** 'CountPublishedArtistsStats' query type */
export interface ICountPublishedArtistsStatsQuery {
  params: ICountPublishedArtistsStatsParams;
  result: ICountPublishedArtistsStatsResult;
}

const countPublishedArtistsStatsIR: any = {"usedParamSet":{},"params":[],"statement":"-- Total published artists in the roster (no filters), used by the home hero.\nSELECT COUNT(*)::int AS total\nFROM artists\nWHERE is_published = TRUE"};

/**
 * Query generated from SQL:
 * ```
 * -- Total published artists in the roster (no filters), used by the home hero.
 * SELECT COUNT(*)::int AS total
 * FROM artists
 * WHERE is_published = TRUE
 * ```
 */
export const countPublishedArtistsStats = new PreparedQuery<ICountPublishedArtistsStatsParams,ICountPublishedArtistsStatsResult>(countPublishedArtistsStatsIR);


