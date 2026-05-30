/** Types generated for queries found in "src/db/query/unavailability/createUnavailability.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type unavailability_source = 'external_gig' | 'personal';

export type DateOrString = Date | string;

/** 'CreateUnavailability' parameters type */
export interface ICreateUnavailabilityParams {
  artistId: string;
  createdBy?: string | null | void;
  createdByKind: string;
  endsAt: DateOrString;
  externalEventLocation?: string | null | void;
  externalEventTitle?: string | null | void;
  notes?: string | null | void;
  source: unavailability_source;
  startsAt: DateOrString;
}

/** 'CreateUnavailability' return type */
export interface ICreateUnavailabilityResult {
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

/** 'CreateUnavailability' query type */
export interface ICreateUnavailabilityQuery {
  params: ICreateUnavailabilityParams;
  result: ICreateUnavailabilityResult;
}

const createUnavailabilityIR: any = {"usedParamSet":{"artistId":true,"startsAt":true,"endsAt":true,"source":true,"externalEventTitle":true,"externalEventLocation":true,"notes":true,"createdByKind":true,"createdBy":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":178,"b":187}]},{"name":"startsAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":190,"b":199}]},{"name":"endsAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":202,"b":209}]},{"name":"source","required":true,"transform":{"type":"scalar"},"locs":[{"a":212,"b":219}]},{"name":"externalEventTitle","required":false,"transform":{"type":"scalar"},"locs":[{"a":224,"b":242}]},{"name":"externalEventLocation","required":false,"transform":{"type":"scalar"},"locs":[{"a":245,"b":266}]},{"name":"notes","required":false,"transform":{"type":"scalar"},"locs":[{"a":269,"b":274}]},{"name":"createdByKind","required":true,"transform":{"type":"scalar"},"locs":[{"a":279,"b":293}]},{"name":"createdBy","required":false,"transform":{"type":"scalar"},"locs":[{"a":296,"b":305}]}],"statement":"INSERT INTO artist_unavailabilities (\n  artist_id, starts_at, ends_at, source,\n  external_event_title, external_event_location, notes,\n  created_by_kind, created_by\n)\nVALUES (\n  :artistId!, :startsAt!, :endsAt!, :source!,\n  :externalEventTitle, :externalEventLocation, :notes,\n  :createdByKind!, :createdBy\n)\nRETURNING id, artist_id, starts_at, ends_at, source,\n          external_event_title, external_event_location, notes, created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO artist_unavailabilities (
 *   artist_id, starts_at, ends_at, source,
 *   external_event_title, external_event_location, notes,
 *   created_by_kind, created_by
 * )
 * VALUES (
 *   :artistId!, :startsAt!, :endsAt!, :source!,
 *   :externalEventTitle, :externalEventLocation, :notes,
 *   :createdByKind!, :createdBy
 * )
 * RETURNING id, artist_id, starts_at, ends_at, source,
 *           external_event_title, external_event_location, notes, created_at
 * ```
 */
export const createUnavailability = new PreparedQuery<ICreateUnavailabilityParams,ICreateUnavailabilityResult>(createUnavailabilityIR);


