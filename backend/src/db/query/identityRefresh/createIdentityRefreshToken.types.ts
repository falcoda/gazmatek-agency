/** Types generated for queries found in "src/db/query/identityRefresh/createIdentityRefreshToken.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'CreateIdentityRefreshToken' parameters type */
export interface ICreateIdentityRefreshTokenParams {
  expiresAt: DateOrString;
  kind: string;
  subjectId: string;
  tokenHash: string;
}

/** 'CreateIdentityRefreshToken' return type */
export interface ICreateIdentityRefreshTokenResult {
  created_at: Date;
  expires_at: Date;
  id: string;
  kind: string;
  subject_id: string;
  token_hash: string;
}

/** 'CreateIdentityRefreshToken' query type */
export interface ICreateIdentityRefreshTokenQuery {
  params: ICreateIdentityRefreshTokenParams;
  result: ICreateIdentityRefreshTokenResult;
}

const createIdentityRefreshTokenIR: any = {"usedParamSet":{"kind":true,"subjectId":true,"tokenHash":true,"expiresAt":true},"params":[{"name":"kind","required":true,"transform":{"type":"scalar"},"locs":[{"a":87,"b":92}]},{"name":"subjectId","required":true,"transform":{"type":"scalar"},"locs":[{"a":95,"b":105}]},{"name":"tokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":108,"b":118}]},{"name":"expiresAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":121,"b":131}]}],"statement":"INSERT INTO identity_refresh_tokens (kind, subject_id, token_hash, expires_at)\nVALUES (:kind!, :subjectId!, :tokenHash!, :expiresAt!)\nRETURNING id, kind, subject_id, token_hash, expires_at, created_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO identity_refresh_tokens (kind, subject_id, token_hash, expires_at)
 * VALUES (:kind!, :subjectId!, :tokenHash!, :expiresAt!)
 * RETURNING id, kind, subject_id, token_hash, expires_at, created_at
 * ```
 */
export const createIdentityRefreshToken = new PreparedQuery<ICreateIdentityRefreshTokenParams,ICreateIdentityRefreshTokenResult>(createIdentityRefreshTokenIR);


