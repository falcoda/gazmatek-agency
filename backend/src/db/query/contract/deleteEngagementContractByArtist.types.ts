/** Types generated for queries found in "src/db/query/contract/deleteEngagementContractByArtist.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteEngagementContractByArtist' parameters type */
export interface IDeleteEngagementContractByArtistParams {
  artistId: string;
}

/** 'DeleteEngagementContractByArtist' return type */
export interface IDeleteEngagementContractByArtistResult {
  id: string;
}

/** 'DeleteEngagementContractByArtist' query type */
export interface IDeleteEngagementContractByArtistQuery {
  params: IDeleteEngagementContractByArtistParams;
  result: IDeleteEngagementContractByArtistResult;
}

const deleteEngagementContractByArtistIR: any = {"usedParamSet":{"artistId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":40,"b":49}]}],"statement":"DELETE FROM contracts\nWHERE artist_id = :artistId!\n  AND kind = 'engagement'\nRETURNING id"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM contracts
 * WHERE artist_id = :artistId!
 *   AND kind = 'engagement'
 * RETURNING id
 * ```
 */
export const deleteEngagementContractByArtist = new PreparedQuery<IDeleteEngagementContractByArtistParams,IDeleteEngagementContractByArtistResult>(deleteEngagementContractByArtistIR);


