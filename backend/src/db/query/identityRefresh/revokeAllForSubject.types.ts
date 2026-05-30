/** Types generated for queries found in "src/db/query/identityRefresh/revokeAllForSubject.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'RevokeAllIdentityRefreshTokensForSubject' parameters type */
export interface IRevokeAllIdentityRefreshTokensForSubjectParams {
  kind: string;
  subjectId: string;
}

/** 'RevokeAllIdentityRefreshTokensForSubject' return type */
export type IRevokeAllIdentityRefreshTokensForSubjectResult = void;

/** 'RevokeAllIdentityRefreshTokensForSubject' query type */
export interface IRevokeAllIdentityRefreshTokensForSubjectQuery {
  params: IRevokeAllIdentityRefreshTokensForSubjectParams;
  result: IRevokeAllIdentityRefreshTokensForSubjectResult;
}

const revokeAllIdentityRefreshTokensForSubjectIR: any = {"usedParamSet":{"kind":true,"subjectId":true},"params":[{"name":"kind","required":true,"transform":{"type":"scalar"},"locs":[{"a":67,"b":72}]},{"name":"subjectId","required":true,"transform":{"type":"scalar"},"locs":[{"a":93,"b":103}]}],"statement":"UPDATE identity_refresh_tokens\nSET revoked_at = NOW()\nWHERE kind = :kind!\n  AND subject_id = :subjectId!\n  AND revoked_at IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE identity_refresh_tokens
 * SET revoked_at = NOW()
 * WHERE kind = :kind!
 *   AND subject_id = :subjectId!
 *   AND revoked_at IS NULL
 * ```
 */
export const revokeAllIdentityRefreshTokensForSubject = new PreparedQuery<IRevokeAllIdentityRefreshTokensForSubjectParams,IRevokeAllIdentityRefreshTokensForSubjectResult>(revokeAllIdentityRefreshTokensForSubjectIR);


