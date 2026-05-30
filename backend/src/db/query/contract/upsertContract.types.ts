/** Types generated for queries found in "src/db/query/contract/upsertContract.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type contract_status = 'cancelled' | 'draft' | 'expired' | 'pending_signature' | 'signed';

/** 'UpsertContract' parameters type */
export interface IUpsertContractParams {
  bookingId: string;
  pdfStorageKey: string;
}

/** 'UpsertContract' return type */
export interface IUpsertContractResult {
  booking_id: string | null;
  id: string;
  pdf_storage_key: string;
  status: contract_status;
  updated_at: Date;
}

/** 'UpsertContract' query type */
export interface IUpsertContractQuery {
  params: IUpsertContractParams;
  result: IUpsertContractResult;
}

const upsertContractIR: any = {"usedParamSet":{"bookingId":true,"pdfStorageKey":true},"params":[{"name":"bookingId","required":true,"transform":{"type":"scalar"},"locs":[{"a":68,"b":78}]},{"name":"pdfStorageKey","required":true,"transform":{"type":"scalar"},"locs":[{"a":81,"b":95}]}],"statement":"INSERT INTO contracts (booking_id, pdf_storage_key, status)\nVALUES (:bookingId!, :pdfStorageKey!, 'pending_signature')\nON CONFLICT (booking_id)\nDO UPDATE SET\n  pdf_storage_key = EXCLUDED.pdf_storage_key,\n  status = 'pending_signature',\n  signature_provider_envelope_id = NULL,\n  signed_at = NULL,\n  signed_pdf_storage_key = NULL,\n  updated_at = NOW()\nRETURNING id, booking_id, pdf_storage_key, status, updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO contracts (booking_id, pdf_storage_key, status)
 * VALUES (:bookingId!, :pdfStorageKey!, 'pending_signature')
 * ON CONFLICT (booking_id)
 * DO UPDATE SET
 *   pdf_storage_key = EXCLUDED.pdf_storage_key,
 *   status = 'pending_signature',
 *   signature_provider_envelope_id = NULL,
 *   signed_at = NULL,
 *   signed_pdf_storage_key = NULL,
 *   updated_at = NOW()
 * RETURNING id, booking_id, pdf_storage_key, status, updated_at
 * ```
 */
export const upsertContract = new PreparedQuery<IUpsertContractParams,IUpsertContractResult>(upsertContractIR);


