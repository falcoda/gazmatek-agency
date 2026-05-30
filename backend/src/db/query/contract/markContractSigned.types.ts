/** Types generated for queries found in "src/db/query/contract/markContractSigned.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type contract_status = 'cancelled' | 'draft' | 'expired' | 'pending_signature' | 'signed';

/** 'MarkContractSigned' parameters type */
export interface IMarkContractSignedParams {
  contractId: string;
  signedPdfStorageKey: string;
}

/** 'MarkContractSigned' return type */
export interface IMarkContractSignedResult {
  id: string;
  signed_at: Date | null;
  status: contract_status;
}

/** 'MarkContractSigned' query type */
export interface IMarkContractSignedQuery {
  params: IMarkContractSignedParams;
  result: IMarkContractSignedResult;
}

const markContractSignedIR: any = {"usedParamSet":{"signedPdfStorageKey":true,"contractId":true},"params":[{"name":"signedPdfStorageKey","required":true,"transform":{"type":"scalar"},"locs":[{"a":92,"b":112}]},{"name":"contractId","required":true,"transform":{"type":"scalar"},"locs":[{"a":149,"b":160}]}],"statement":"UPDATE contracts\nSET status = 'signed',\n    signed_at = NOW(),\n    signed_pdf_storage_key = :signedPdfStorageKey!,\n    updated_at = NOW()\nWHERE id = :contractId!\n  AND status = 'pending_signature'\nRETURNING id, status, signed_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE contracts
 * SET status = 'signed',
 *     signed_at = NOW(),
 *     signed_pdf_storage_key = :signedPdfStorageKey!,
 *     updated_at = NOW()
 * WHERE id = :contractId!
 *   AND status = 'pending_signature'
 * RETURNING id, status, signed_at
 * ```
 */
export const markContractSigned = new PreparedQuery<IMarkContractSignedParams,IMarkContractSignedResult>(markContractSignedIR);


