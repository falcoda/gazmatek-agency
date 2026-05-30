/** Types generated for queries found in "src/db/query/contract/getContractByBookingId.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type contract_status = 'cancelled' | 'draft' | 'expired' | 'pending_signature' | 'signed';

/** 'GetContractByBookingId' parameters type */
export interface IGetContractByBookingIdParams {
  bookingId: string;
}

/** 'GetContractByBookingId' return type */
export interface IGetContractByBookingIdResult {
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

/** 'GetContractByBookingId' query type */
export interface IGetContractByBookingIdQuery {
  params: IGetContractByBookingIdParams;
  result: IGetContractByBookingIdResult;
}

const getContractByBookingIdIR: any = {"usedParamSet":{"bookingId":true},"params":[{"name":"bookingId","required":true,"transform":{"type":"scalar"},"locs":[{"a":224,"b":234}]}],"statement":"SELECT id, booking_id, pdf_storage_key, status, signature_provider,\n       signature_provider_envelope_id, signed_at, signed_pdf_storage_key,\n       last_reminder_at, created_at, updated_at\nFROM contracts\nWHERE booking_id = :bookingId!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, booking_id, pdf_storage_key, status, signature_provider,
 *        signature_provider_envelope_id, signed_at, signed_pdf_storage_key,
 *        last_reminder_at, created_at, updated_at
 * FROM contracts
 * WHERE booking_id = :bookingId!
 * LIMIT 1
 * ```
 */
export const getContractByBookingId = new PreparedQuery<IGetContractByBookingIdParams,IGetContractByBookingIdResult>(getContractByBookingIdIR);


