/** Types generated for queries found in "src/db/query/unavailability/deleteUnavailability.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteUnavailability' parameters type */
export interface IDeleteUnavailabilityParams {
  artistId: string;
  enforceArtistId?: boolean | null | void;
  unavailabilityId: string;
}

/** 'DeleteUnavailability' return type */
export interface IDeleteUnavailabilityResult {
  id: string;
}

/** 'DeleteUnavailability' query type */
export interface IDeleteUnavailabilityQuery {
  params: IDeleteUnavailabilityParams;
  result: IDeleteUnavailabilityResult;
}

const deleteUnavailabilityIR: any = {"usedParamSet":{"unavailabilityId":true,"enforceArtistId":true,"artistId":true},"params":[{"name":"unavailabilityId","required":true,"transform":{"type":"scalar"},"locs":[{"a":47,"b":64}]},{"name":"enforceArtistId","required":false,"transform":{"type":"scalar"},"locs":[{"a":73,"b":88}]},{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":122,"b":131}]}],"statement":"DELETE FROM artist_unavailabilities\nWHERE id = :unavailabilityId!\n  AND (:enforceArtistId::boolean = FALSE OR artist_id = :artistId!)\nRETURNING id"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM artist_unavailabilities
 * WHERE id = :unavailabilityId!
 *   AND (:enforceArtistId::boolean = FALSE OR artist_id = :artistId!)
 * RETURNING id
 * ```
 */
export const deleteUnavailability = new PreparedQuery<IDeleteUnavailabilityParams,IDeleteUnavailabilityResult>(deleteUnavailabilityIR);


