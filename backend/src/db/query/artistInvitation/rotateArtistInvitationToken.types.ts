/** Types generated for queries found in "src/db/query/artistInvitation/rotateArtistInvitationToken.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_invitation_status = 'accepted' | 'expired' | 'pending' | 'revoked';

export type DateOrString = Date | string;

/** 'RotateArtistInvitationToken' parameters type */
export interface IRotateArtistInvitationTokenParams {
  expiresAt: DateOrString;
  invitationId: string;
  tokenHash: string;
}

/** 'RotateArtistInvitationToken' return type */
export interface IRotateArtistInvitationTokenResult {
  created_at: Date;
  custom_message: string | null;
  email: string;
  expires_at: Date;
  id: string;
  last_resent_at: Date | null;
  level: string;
  resend_count: number;
  set_type: string;
  stage_name: string;
  status: artist_invitation_status;
}

/** 'RotateArtistInvitationToken' query type */
export interface IRotateArtistInvitationTokenQuery {
  params: IRotateArtistInvitationTokenParams;
  result: IRotateArtistInvitationTokenResult;
}

const rotateArtistInvitationTokenIR: any = {"usedParamSet":{"tokenHash":true,"expiresAt":true,"invitationId":true},"params":[{"name":"tokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":272,"b":282}]},{"name":"expiresAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":302,"b":312}]},{"name":"invitationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":414,"b":427}]}],"statement":"-- Rotates the magic token on admin resend. Accepted/revoked invitations are\n-- intentionally excluded — the WHERE clause guarantees we never reactivate\n-- a closed invitation. Expired ones flip back to pending with the new TTL.\nUPDATE artist_invitations\nSET token_hash = :tokenHash!,\n    expires_at = :expiresAt!,\n    last_resent_at = NOW(),\n    resend_count = resend_count + 1,\n    status = 'pending'\nWHERE id = :invitationId!\n  AND status IN ('pending', 'expired')\nRETURNING\n  id, email, stage_name, level, set_type, custom_message,\n  expires_at, status, resend_count, last_resent_at, created_at"};

/**
 * Query generated from SQL:
 * ```
 * -- Rotates the magic token on admin resend. Accepted/revoked invitations are
 * -- intentionally excluded — the WHERE clause guarantees we never reactivate
 * -- a closed invitation. Expired ones flip back to pending with the new TTL.
 * UPDATE artist_invitations
 * SET token_hash = :tokenHash!,
 *     expires_at = :expiresAt!,
 *     last_resent_at = NOW(),
 *     resend_count = resend_count + 1,
 *     status = 'pending'
 * WHERE id = :invitationId!
 *   AND status IN ('pending', 'expired')
 * RETURNING
 *   id, email, stage_name, level, set_type, custom_message,
 *   expires_at, status, resend_count, last_resent_at, created_at
 * ```
 */
export const rotateArtistInvitationToken = new PreparedQuery<IRotateArtistInvitationTokenParams,IRotateArtistInvitationTokenResult>(rotateArtistInvitationTokenIR);


