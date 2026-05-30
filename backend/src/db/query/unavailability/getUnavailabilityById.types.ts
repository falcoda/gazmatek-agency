/** Types generated for queries found in "src/db/query/unavailability/getUnavailabilityById.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type unavailability_source = 'external_gig' | 'personal';

/** 'GetUnavailabilityById' parameters type */
export interface IGetUnavailabilityByIdParams {
  unavailabilityId: string;
}

/** 'GetUnavailabilityById' return type */
export interface IGetUnavailabilityByIdResult {
  artist_id: string;
  created_at: Date;
  created_by: string | null;
  created_by_kind: string;
  ends_at: Date;
  external_event_location: string | null;
  external_event_title: string | null;
  id: string;
  notes: string | null;
  source: unavailability_source;
  starts_at: Date;
}

/** 'GetUnavailabilityById' query type */
export interface IGetUnavailabilityByIdQuery {
  params: IGetUnavailabilityByIdParams;
  result: IGetUnavailabilityByIdResult;
}

const getUnavailabilityByIdIR: any = {"usedParamSet":{"unavailabilityId":true},"params":[{"name":"unavailabilityId","required":true,"transform":{"type":"scalar"},"locs":[{"a":198,"b":215}]}],"statement":"SELECT id, artist_id, starts_at, ends_at, source,\n       external_event_title, external_event_location, notes,\n       created_by_kind, created_by, created_at\nFROM artist_unavailabilities\nWHERE id = :unavailabilityId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, artist_id, starts_at, ends_at, source,
 *        external_event_title, external_event_location, notes,
 *        created_by_kind, created_by, created_at
 * FROM artist_unavailabilities
 * WHERE id = :unavailabilityId!
 * ```
 */
export const getUnavailabilityById = new PreparedQuery<IGetUnavailabilityByIdParams,IGetUnavailabilityByIdResult>(getUnavailabilityByIdIR);


