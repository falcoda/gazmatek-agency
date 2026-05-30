/** Types generated for queries found in "src/db/query/contract/setEngagementSigningInfo.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type contract_status = 'cancelled' | 'draft' | 'expired' | 'pending_signature' | 'signed';

/** 'SetEngagementSigningInfo' parameters type */
export interface ISetEngagementSigningInfoParams {
  contractId: string;
  envelopeId: string;
  pdfStorageKey: string;
  provider: string;
}

/** 'SetEngagementSigningInfo' return type */
export interface ISetEngagementSigningInfoResult {
  id: string;
  signature_provider: string | null;
  signature_provider_envelope_id: string | null;
  status: contract_status;
}

/** 'SetEngagementSigningInfo' query type */
export interface ISetEngagementSigningInfoQuery {
  params: ISetEngagementSigningInfoParams;
  result: ISetEngagementSigningInfoResult;
}

const setEngagementSigningInfoIR: any = {"usedParamSet":{"provider":true,"envelopeId":true,"pdfStorageKey":true,"contractId":true},"params":[{"name":"provider","required":true,"transform":{"type":"scalar"},"locs":[{"a":42,"b":51}]},{"name":"envelopeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":91,"b":102}]},{"name":"pdfStorageKey","required":true,"transform":{"type":"scalar"},"locs":[{"a":127,"b":141}]},{"name":"contractId","required":true,"transform":{"type":"scalar"},"locs":[{"a":212,"b":223}]}],"statement":"UPDATE contracts\nSET signature_provider = :provider!,\n    signature_provider_envelope_id = :envelopeId!,\n    pdf_storage_key = :pdfStorageKey!,\n    status = 'pending_signature',\n    updated_at = NOW()\nWHERE id = :contractId!\n  AND kind = 'engagement'\nRETURNING id, status, signature_provider, signature_provider_envelope_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE contracts
 * SET signature_provider = :provider!,
 *     signature_provider_envelope_id = :envelopeId!,
 *     pdf_storage_key = :pdfStorageKey!,
 *     status = 'pending_signature',
 *     updated_at = NOW()
 * WHERE id = :contractId!
 *   AND kind = 'engagement'
 * RETURNING id, status, signature_provider, signature_provider_envelope_id
 * ```
 */
export const setEngagementSigningInfo = new PreparedQuery<ISetEngagementSigningInfoParams,ISetEngagementSigningInfoResult>(setEngagementSigningInfoIR);


