/** Types generated for queries found in "src/db/query/artist/setArtistEngagementContract.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'SetArtistEngagementContract' parameters type */
export interface ISetArtistEngagementContractParams {
  artistId: string;
  contractId: string;
}

/** 'SetArtistEngagementContract' return type */
export interface ISetArtistEngagementContractResult {
  engagement_contract_id: string | null;
  id: string;
}

/** 'SetArtistEngagementContract' query type */
export interface ISetArtistEngagementContractQuery {
  params: ISetArtistEngagementContractParams;
  result: ISetArtistEngagementContractResult;
}

const setArtistEngagementContractIR: any = {"usedParamSet":{"contractId":true,"artistId":true},"params":[{"name":"contractId","required":true,"transform":{"type":"scalar"},"locs":[{"a":44,"b":55}]},{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":92,"b":101}]}],"statement":"UPDATE artists\nSET engagement_contract_id = :contractId!,\n    updated_at = NOW()\nWHERE id = :artistId!\nRETURNING id, engagement_contract_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE artists
 * SET engagement_contract_id = :contractId!,
 *     updated_at = NOW()
 * WHERE id = :artistId!
 * RETURNING id, engagement_contract_id
 * ```
 */
export const setArtistEngagementContract = new PreparedQuery<ISetArtistEngagementContractParams,ISetArtistEngagementContractResult>(setArtistEngagementContractIR);


