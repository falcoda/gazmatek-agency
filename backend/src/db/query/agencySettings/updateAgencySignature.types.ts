/** Types generated for queries found in "src/db/query/agencySettings/updateAgencySignature.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpdateAgencySignature' parameters type */
export interface IUpdateAgencySignatureParams {
  signatureImagePath?: string | null | void;
}

/** 'UpdateAgencySignature' return type */
export interface IUpdateAgencySignatureResult {
  signature_image_path: string | null;
}

/** 'UpdateAgencySignature' query type */
export interface IUpdateAgencySignatureQuery {
  params: IUpdateAgencySignatureParams;
  result: IUpdateAgencySignatureResult;
}

const updateAgencySignatureIR: any = {"usedParamSet":{"signatureImagePath":true},"params":[{"name":"signatureImagePath","required":false,"transform":{"type":"scalar"},"locs":[{"a":50,"b":68}]}],"statement":"UPDATE agency_settings\nSET signature_image_path = :signatureImagePath,\n    updated_at = NOW()\nWHERE id = TRUE\nRETURNING signature_image_path"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE agency_settings
 * SET signature_image_path = :signatureImagePath,
 *     updated_at = NOW()
 * WHERE id = TRUE
 * RETURNING signature_image_path
 * ```
 */
export const updateAgencySignature = new PreparedQuery<IUpdateAgencySignatureParams,IUpdateAgencySignatureResult>(updateAgencySignatureIR);


