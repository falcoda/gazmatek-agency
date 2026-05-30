/** Types generated for queries found in "src/db/query/contract/insertEngagementContract.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type contract_status = 'cancelled' | 'draft' | 'expired' | 'pending_signature' | 'signed';

/** 'InsertEngagementContract' parameters type */
export interface IInsertEngagementContractParams {
  artistId: string;
  pdfStorageKey: string;
  templateVersion: string;
}

/** 'InsertEngagementContract' return type */
export interface IInsertEngagementContractResult {
  artist_id: string | null;
  created_at: Date;
  id: string;
  pdf_storage_key: string;
  signed_at: Date | null;
  signed_pdf_storage_key: string | null;
  status: contract_status;
  updated_at: Date;
}

/** 'InsertEngagementContract' query type */
export interface IInsertEngagementContractQuery {
  params: IInsertEngagementContractParams;
  result: IInsertEngagementContractResult;
}

const insertEngagementContractIR: any = {"usedParamSet":{"artistId":true,"pdfStorageKey":true,"templateVersion":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":91,"b":100}]},{"name":"pdfStorageKey","required":true,"transform":{"type":"scalar"},"locs":[{"a":117,"b":131}]},{"name":"templateVersion","required":true,"transform":{"type":"scalar"},"locs":[{"a":143,"b":159}]}],"statement":"INSERT INTO contracts (artist_id, kind, pdf_storage_key, status, template_version)\nVALUES (:artistId!, 'engagement', :pdfStorageKey!, 'draft', :templateVersion!)\nRETURNING id, artist_id, pdf_storage_key, status, signed_at, signed_pdf_storage_key,\n          created_at, updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO contracts (artist_id, kind, pdf_storage_key, status, template_version)
 * VALUES (:artistId!, 'engagement', :pdfStorageKey!, 'draft', :templateVersion!)
 * RETURNING id, artist_id, pdf_storage_key, status, signed_at, signed_pdf_storage_key,
 *           created_at, updated_at
 * ```
 */
export const insertEngagementContract = new PreparedQuery<IInsertEngagementContractParams,IInsertEngagementContractResult>(insertEngagementContractIR);


