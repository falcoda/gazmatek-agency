/** Types generated for queries found in "src/db/query/contract/getEngagementContractByArtist.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type contract_status = 'cancelled' | 'draft' | 'expired' | 'pending_signature' | 'signed';

/** 'GetEngagementContractByArtist' parameters type */
export interface IGetEngagementContractByArtistParams {
  artistId: string;
}

/** 'GetEngagementContractByArtist' return type */
export interface IGetEngagementContractByArtistResult {
  artist_id: string | null;
  created_at: Date;
  id: string;
  pdf_storage_key: string;
  signature_provider: string | null;
  signature_provider_envelope_id: string | null;
  signed_at: Date | null;
  signed_pdf_storage_key: string | null;
  status: contract_status;
  updated_at: Date;
}

/** 'GetEngagementContractByArtist' query type */
export interface IGetEngagementContractByArtistQuery {
  params: IGetEngagementContractByArtistParams;
  result: IGetEngagementContractByArtistResult;
}

const getEngagementContractByArtistIR: any = {"usedParamSet":{"artistId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":211,"b":220}]}],"statement":"SELECT id, artist_id, pdf_storage_key, status,\n       signature_provider, signature_provider_envelope_id,\n       signed_at, signed_pdf_storage_key,\n       created_at, updated_at\nFROM contracts\nWHERE artist_id = :artistId!\n  AND kind = 'engagement'\nORDER BY created_at DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, artist_id, pdf_storage_key, status,
 *        signature_provider, signature_provider_envelope_id,
 *        signed_at, signed_pdf_storage_key,
 *        created_at, updated_at
 * FROM contracts
 * WHERE artist_id = :artistId!
 *   AND kind = 'engagement'
 * ORDER BY created_at DESC
 * LIMIT 1
 * ```
 */
export const getEngagementContractByArtist = new PreparedQuery<IGetEngagementContractByArtistParams,IGetEngagementContractByArtistResult>(getEngagementContractByArtistIR);


