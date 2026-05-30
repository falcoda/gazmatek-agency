/** Types generated for queries found in "src/db/query/unavailability/listUnavailabilitiesInRange.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type unavailability_source = 'external_gig' | 'personal';

export type DateOrString = Date | string;

/** 'ListUnavailabilitiesInRange' parameters type */
export interface IListUnavailabilitiesInRangeParams {
  artistId: string;
  rangeEnd: DateOrString;
  rangeStart: DateOrString;
}

/** 'ListUnavailabilitiesInRange' return type */
export interface IListUnavailabilitiesInRangeResult {
  artist_id: string;
  created_at: Date;
  ends_at: Date;
  external_event_location: string | null;
  external_event_title: string | null;
  id: string;
  notes: string | null;
  source: unavailability_source;
  starts_at: Date;
}

/** 'ListUnavailabilitiesInRange' query type */
export interface IListUnavailabilitiesInRangeQuery {
  params: IListUnavailabilitiesInRangeParams;
  result: IListUnavailabilitiesInRangeResult;
}

const listUnavailabilitiesInRangeIR: any = {"usedParamSet":{"artistId":true,"rangeStart":true,"rangeEnd":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":169,"b":178}]},{"name":"rangeStart","required":true,"transform":{"type":"scalar"},"locs":[{"a":235,"b":246}]},{"name":"rangeEnd","required":true,"transform":{"type":"scalar"},"locs":[{"a":249,"b":258}]}],"statement":"SELECT id, artist_id, starts_at, ends_at, source,\n       external_event_title, external_event_location, notes, created_at\nFROM artist_unavailabilities\nWHERE artist_id = :artistId!\n  AND tstzrange(starts_at, ends_at, '[)') && tstzrange(:rangeStart!, :rangeEnd!, '[)')\nORDER BY starts_at ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, artist_id, starts_at, ends_at, source,
 *        external_event_title, external_event_location, notes, created_at
 * FROM artist_unavailabilities
 * WHERE artist_id = :artistId!
 *   AND tstzrange(starts_at, ends_at, '[)') && tstzrange(:rangeStart!, :rangeEnd!, '[)')
 * ORDER BY starts_at ASC
 * ```
 */
export const listUnavailabilitiesInRange = new PreparedQuery<IListUnavailabilitiesInRangeParams,IListUnavailabilitiesInRangeResult>(listUnavailabilitiesInRangeIR);


