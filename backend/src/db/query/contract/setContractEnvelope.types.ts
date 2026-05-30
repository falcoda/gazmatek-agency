/** Types generated for queries found in "src/db/query/contract/setContractEnvelope.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'SetContractEnvelope' parameters type */
export interface ISetContractEnvelopeParams {
  contractId: string;
  envelopeId: string;
  provider: string;
}

/** 'SetContractEnvelope' return type */
export interface ISetContractEnvelopeResult {
  id: string;
  signature_provider_envelope_id: string | null;
}

/** 'SetContractEnvelope' query type */
export interface ISetContractEnvelopeQuery {
  params: ISetContractEnvelopeParams;
  result: ISetContractEnvelopeResult;
}

const setContractEnvelopeIR: any = {"usedParamSet":{"provider":true,"envelopeId":true,"contractId":true},"params":[{"name":"provider","required":true,"transform":{"type":"scalar"},"locs":[{"a":42,"b":51}]},{"name":"envelopeId","required":true,"transform":{"type":"scalar"},"locs":[{"a":91,"b":102}]},{"name":"contractId","required":true,"transform":{"type":"scalar"},"locs":[{"a":139,"b":150}]}],"statement":"UPDATE contracts\nSET signature_provider = :provider!,\n    signature_provider_envelope_id = :envelopeId!,\n    updated_at = NOW()\nWHERE id = :contractId!\nRETURNING id, signature_provider_envelope_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE contracts
 * SET signature_provider = :provider!,
 *     signature_provider_envelope_id = :envelopeId!,
 *     updated_at = NOW()
 * WHERE id = :contractId!
 * RETURNING id, signature_provider_envelope_id
 * ```
 */
export const setContractEnvelope = new PreparedQuery<ISetContractEnvelopeParams,ISetContractEnvelopeResult>(setContractEnvelopeIR);


