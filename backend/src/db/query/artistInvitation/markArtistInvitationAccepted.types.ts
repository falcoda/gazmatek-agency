/** Types generated for queries found in "src/db/query/artistInvitation/markArtistInvitationAccepted.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_invitation_status = 'accepted' | 'expired' | 'pending' | 'revoked';

/** 'MarkArtistInvitationAccepted' parameters type */
export interface IMarkArtistInvitationAcceptedParams {
  artistId: string;
  invitationId: string;
}

/** 'MarkArtistInvitationAccepted' return type */
export interface IMarkArtistInvitationAcceptedResult {
  accepted_at: Date | null;
  id: string;
  status: artist_invitation_status;
}

/** 'MarkArtistInvitationAccepted' query type */
export interface IMarkArtistInvitationAcceptedQuery {
  params: IMarkArtistInvitationAcceptedParams;
  result: IMarkArtistInvitationAcceptedResult;
}

const markArtistInvitationAcceptedIR: any = {"usedParamSet":{"artistId":true,"invitationId":true},"params":[{"name":"artistId","required":true,"transform":{"type":"scalar"},"locs":[{"a":308,"b":317}]},{"name":"invitationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":330,"b":343}]}],"statement":"-- Single-shot acceptance. The WHERE clause makes this safe against double\n-- submits: a second call returns zero rows, letting the service raise a\n-- ConflictError instead of creating duplicate artist/account rows.\nUPDATE artist_invitations\nSET status = 'accepted',\n    accepted_at = NOW(),\n    artist_id = :artistId!\nWHERE id = :invitationId!\n  AND status = 'pending'\nRETURNING id, status, accepted_at"};

/**
 * Query generated from SQL:
 * ```
 * -- Single-shot acceptance. The WHERE clause makes this safe against double
 * -- submits: a second call returns zero rows, letting the service raise a
 * -- ConflictError instead of creating duplicate artist/account rows.
 * UPDATE artist_invitations
 * SET status = 'accepted',
 *     accepted_at = NOW(),
 *     artist_id = :artistId!
 * WHERE id = :invitationId!
 *   AND status = 'pending'
 * RETURNING id, status, accepted_at
 * ```
 */
export const markArtistInvitationAccepted = new PreparedQuery<IMarkArtistInvitationAcceptedParams,IMarkArtistInvitationAcceptedResult>(markArtistInvitationAcceptedIR);


