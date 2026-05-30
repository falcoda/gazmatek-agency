/** Types generated for queries found in "src/db/query/artistInvitation/getArtistInvitationByTokenHash.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_invitation_status = 'accepted' | 'expired' | 'pending' | 'revoked';

/** 'GetArtistInvitationByTokenHash' parameters type */
export interface IGetArtistInvitationByTokenHashParams {
  tokenHash: string;
}

/** 'GetArtistInvitationByTokenHash' return type */
export interface IGetArtistInvitationByTokenHashResult {
  accepted_at: Date | null;
  artist_id: string | null;
  created_at: Date;
  custom_message: string | null;
  email: string;
  expires_at: Date;
  id: string;
  level: string;
  set_type: string;
  stage_name: string;
  status: artist_invitation_status;
}

/** 'GetArtistInvitationByTokenHash' query type */
export interface IGetArtistInvitationByTokenHashQuery {
  params: IGetArtistInvitationByTokenHashParams;
  result: IGetArtistInvitationByTokenHashResult;
}

const getArtistInvitationByTokenHashIR: any = {"usedParamSet":{"tokenHash":true},"params":[{"name":"tokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":376,"b":386}]}],"statement":"-- Looks up an invitation by token hash. Returns the row regardless of status:\n-- the service layer decides whether to expose details (pending+unexpired) or\n-- surface an \"invalid\" error to the public endpoint.\nSELECT\n  id, email, stage_name, level, set_type, custom_message,\n  expires_at, status, artist_id, accepted_at, created_at\nFROM artist_invitations\nWHERE token_hash = :tokenHash!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * -- Looks up an invitation by token hash. Returns the row regardless of status:
 * -- the service layer decides whether to expose details (pending+unexpired) or
 * -- surface an "invalid" error to the public endpoint.
 * SELECT
 *   id, email, stage_name, level, set_type, custom_message,
 *   expires_at, status, artist_id, accepted_at, created_at
 * FROM artist_invitations
 * WHERE token_hash = :tokenHash!
 * LIMIT 1
 * ```
 */
export const getArtistInvitationByTokenHash = new PreparedQuery<IGetArtistInvitationByTokenHashParams,IGetArtistInvitationByTokenHashResult>(getArtistInvitationByTokenHashIR);


