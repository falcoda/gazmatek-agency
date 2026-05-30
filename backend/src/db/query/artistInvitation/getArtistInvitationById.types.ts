/** Types generated for queries found in "src/db/query/artistInvitation/getArtistInvitationById.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_invitation_status = 'accepted' | 'expired' | 'pending' | 'revoked';

/** 'GetArtistInvitationById' parameters type */
export interface IGetArtistInvitationByIdParams {
  invitationId: string;
}

/** 'GetArtistInvitationById' return type */
export interface IGetArtistInvitationByIdResult {
  accepted_at: Date | null;
  artist_id: string | null;
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

/** 'GetArtistInvitationById' query type */
export interface IGetArtistInvitationByIdQuery {
  params: IGetArtistInvitationByIdParams;
  result: IGetArtistInvitationByIdResult;
}

const getArtistInvitationByIdIR: any = {"usedParamSet":{"invitationId":true},"params":[{"name":"invitationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":189,"b":202}]}],"statement":"SELECT\n  id, email, stage_name, level, set_type, custom_message,\n  expires_at, status, artist_id, accepted_at,\n  last_resent_at, resend_count, created_at\nFROM artist_invitations\nWHERE id = :invitationId!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id, email, stage_name, level, set_type, custom_message,
 *   expires_at, status, artist_id, accepted_at,
 *   last_resent_at, resend_count, created_at
 * FROM artist_invitations
 * WHERE id = :invitationId!
 * LIMIT 1
 * ```
 */
export const getArtistInvitationById = new PreparedQuery<IGetArtistInvitationByIdParams,IGetArtistInvitationByIdResult>(getArtistInvitationByIdIR);


