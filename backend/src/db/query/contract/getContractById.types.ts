/** Types generated for queries found in "src/db/query/contract/getContractById.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type contract_status = 'cancelled' | 'draft' | 'expired' | 'pending_signature' | 'signed';

/** 'GetContractById' parameters type */
export interface IGetContractByIdParams {
  contractId: string;
}

/** 'GetContractById' return type */
export interface IGetContractByIdResult {
  artist_id: string;
  booking_id: string | null;
  created_at: Date;
  id: string;
  last_reminder_at: Date | null;
  pdf_storage_key: string;
  signature_provider: string | null;
  signature_provider_envelope_id: string | null;
  signed_at: Date | null;
  signed_pdf_storage_key: string | null;
  status: contract_status;
  updated_at: Date;
}

/** 'GetContractById' query type */
export interface IGetContractByIdQuery {
  params: IGetContractByIdParams;
  result: IGetContractByIdResult;
}

const getContractByIdIR: any = {"usedParamSet":{"contractId":true},"params":[{"name":"contractId","required":true,"transform":{"type":"scalar"},"locs":[{"a":308,"b":319}]}],"statement":"SELECT c.id, c.booking_id, c.pdf_storage_key, c.status,\n       c.signature_provider, c.signature_provider_envelope_id,\n       c.signed_at, c.signed_pdf_storage_key,\n       c.last_reminder_at, c.created_at, c.updated_at,\n       b.artist_id\nFROM contracts c\nJOIN bookings b ON b.id = c.booking_id\nWHERE c.id = :contractId!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT c.id, c.booking_id, c.pdf_storage_key, c.status,
 *        c.signature_provider, c.signature_provider_envelope_id,
 *        c.signed_at, c.signed_pdf_storage_key,
 *        c.last_reminder_at, c.created_at, c.updated_at,
 *        b.artist_id
 * FROM contracts c
 * JOIN bookings b ON b.id = c.booking_id
 * WHERE c.id = :contractId!
 * LIMIT 1
 * ```
 */
export const getContractById = new PreparedQuery<IGetContractByIdParams,IGetContractByIdResult>(getContractByIdIR);


