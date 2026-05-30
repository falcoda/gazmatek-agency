/** Types generated for queries found in "src/db/query/artistAccount/setArtistPasswordResetToken.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'SetArtistPasswordResetToken' parameters type */
export interface ISetArtistPasswordResetTokenParams {
  email: string;
  expiresAt: DateOrString;
  tokenHash: string;
}

/** 'SetArtistPasswordResetToken' return type */
export interface ISetArtistPasswordResetTokenResult {
  artist_id: string;
}

/** 'SetArtistPasswordResetToken' query type */
export interface ISetArtistPasswordResetTokenQuery {
  params: ISetArtistPasswordResetTokenParams;
  result: ISetArtistPasswordResetTokenResult;
}

const setArtistPasswordResetTokenIR: any = {"usedParamSet":{"tokenHash":true,"expiresAt":true,"email":true},"params":[{"name":"tokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":55,"b":65}]},{"name":"expiresAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":100,"b":110}]},{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":126,"b":132}]}],"statement":"UPDATE artist_accounts\nSET password_reset_token_hash = :tokenHash!,\n    password_reset_expires_at = :expiresAt!\nWHERE email = :email!\nRETURNING artist_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE artist_accounts
 * SET password_reset_token_hash = :tokenHash!,
 *     password_reset_expires_at = :expiresAt!
 * WHERE email = :email!
 * RETURNING artist_id
 * ```
 */
export const setArtistPasswordResetToken = new PreparedQuery<ISetArtistPasswordResetTokenParams,ISetArtistPasswordResetTokenResult>(setArtistPasswordResetTokenIR);


