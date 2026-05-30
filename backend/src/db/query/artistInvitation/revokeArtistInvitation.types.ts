/** Types generated for queries found in "src/db/query/artistInvitation/revokeArtistInvitation.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_invitation_status = 'accepted' | 'expired' | 'pending' | 'revoked';

/** 'RevokeArtistInvitation' parameters type */
export interface IRevokeArtistInvitationParams {
  invitationId: string;
}

/** 'RevokeArtistInvitation' return type */
export interface IRevokeArtistInvitationResult {
  id: string;
  status: artist_invitation_status;
}

/** 'RevokeArtistInvitation' query type */
export interface IRevokeArtistInvitationQuery {
  params: IRevokeArtistInvitationParams;
  result: IRevokeArtistInvitationResult;
}

const revokeArtistInvitationIR: any = {"usedParamSet":{"invitationId":true},"params":[{"name":"invitationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":60,"b":73}]}],"statement":"UPDATE artist_invitations\nSET status = 'revoked'\nWHERE id = :invitationId!\n  AND status IN ('pending', 'expired')\nRETURNING id, status"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE artist_invitations
 * SET status = 'revoked'
 * WHERE id = :invitationId!
 *   AND status IN ('pending', 'expired')
 * RETURNING id, status
 * ```
 */
export const revokeArtistInvitation = new PreparedQuery<IRevokeArtistInvitationParams,IRevokeArtistInvitationResult>(revokeArtistInvitationIR);


