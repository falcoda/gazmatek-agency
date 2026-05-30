/** Types generated for queries found in "src/db/query/clientAccount/setClientInvitationTokenById.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'SetClientInvitationTokenById' parameters type */
export interface ISetClientInvitationTokenByIdParams {
  clientId: string;
  expiresAt: DateOrString;
  tokenHash: string;
}

/** 'SetClientInvitationTokenById' return type */
export interface ISetClientInvitationTokenByIdResult {
  display_name: string | null;
  email: string | null;
  id: string;
}

/** 'SetClientInvitationTokenById' query type */
export interface ISetClientInvitationTokenByIdQuery {
  params: ISetClientInvitationTokenByIdParams;
  result: ISetClientInvitationTokenByIdResult;
}

const setClientInvitationTokenByIdIR: any = {"usedParamSet":{"tokenHash":true,"expiresAt":true,"clientId":true},"params":[{"name":"tokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":324,"b":334}]},{"name":"expiresAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":369,"b":379}]},{"name":"clientId","required":true,"transform":{"type":"scalar"},"locs":[{"a":392,"b":401}]}],"statement":"-- Sets a single-use token an admin can email to a stub client so they can set\n-- their password and claim the account. Reuses the existing password_reset_*\n-- columns since the underlying mechanic is the same (consumeClientPasswordResetToken\n-- finalizes both flows).\nUPDATE client_accounts\nSET password_reset_token_hash = :tokenHash!,\n    password_reset_expires_at = :expiresAt!\nWHERE id = :clientId!\nRETURNING id, email, display_name"};

/**
 * Query generated from SQL:
 * ```
 * -- Sets a single-use token an admin can email to a stub client so they can set
 * -- their password and claim the account. Reuses the existing password_reset_*
 * -- columns since the underlying mechanic is the same (consumeClientPasswordResetToken
 * -- finalizes both flows).
 * UPDATE client_accounts
 * SET password_reset_token_hash = :tokenHash!,
 *     password_reset_expires_at = :expiresAt!
 * WHERE id = :clientId!
 * RETURNING id, email, display_name
 * ```
 */
export const setClientInvitationTokenById = new PreparedQuery<ISetClientInvitationTokenByIdParams,ISetClientInvitationTokenByIdResult>(setClientInvitationTokenByIdIR);


