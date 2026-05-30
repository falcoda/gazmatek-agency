/** Types generated for queries found in "src/db/query/contract/getContractByEnvelopeId.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type contract_status = 'cancelled' | 'draft' | 'expired' | 'pending_signature' | 'signed';

/** 'GetContractByEnvelopeId' parameters type */
export interface IGetContractByEnvelopeIdParams {
  envelopeId: string;
}

/** 'GetContractByEnvelopeId' return type */
export interface IGetContractByEnvelopeIdResult {
  artist_id: string | null;
  booking_id: string | null;
  created_at: Date;
  id: string;
  kind: string;
  pdf_storage_key: string;
  signature_provider: string | null;
  signature_provider_envelope_id: string | null;
  signed_at: Date | null;
  signed_pdf_storage_key: string | null;
  status: contract_status;
  updated_at: Date;
}

/** 'GetContractByEnvelopeId' query type */
export interface IGetContractByEnvelopeIdQuery {
  params: IGetContractByEnvelopeIdParams;
  result: IGetContractByEnvelopeIdResult;
}

const getContractByEnvelopeIdIR: any = {"usedParamSet":{"envelopeId":true},"params":[{"name":"envelopeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":250,"b":261}]}],"statement":"SELECT id, kind, artist_id, booking_id, pdf_storage_key, status,\n       signature_provider, signature_provider_envelope_id,\n       signed_at, signed_pdf_storage_key,\n       created_at, updated_at\nFROM contracts\nWHERE signature_provider_envelope_id = :envelopeId!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, kind, artist_id, booking_id, pdf_storage_key, status,
 *        signature_provider, signature_provider_envelope_id,
 *        signed_at, signed_pdf_storage_key,
 *        created_at, updated_at
 * FROM contracts
 * WHERE signature_provider_envelope_id = :envelopeId!
 * LIMIT 1
 * ```
 */
export const getContractByEnvelopeId = new PreparedQuery<IGetContractByEnvelopeIdParams,IGetContractByEnvelopeIdResult>(getContractByEnvelopeIdIR);


