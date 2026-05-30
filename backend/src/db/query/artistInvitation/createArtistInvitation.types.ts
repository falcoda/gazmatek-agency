/** Types generated for queries found in "src/db/query/artistInvitation/createArtistInvitation.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_invitation_status = 'accepted' | 'expired' | 'pending' | 'revoked';

export type DateOrString = Date | string;

/** 'CreateArtistInvitation' parameters type */
export interface ICreateArtistInvitationParams {
  customMessage?: string | null | void;
  email: string;
  expiresAt: DateOrString;
  invitedBy: string;
  level: string;
  setType: string;
  stageName: string;
  tokenHash: string;
}

/** 'CreateArtistInvitation' return type */
export interface ICreateArtistInvitationResult {
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

/** 'CreateArtistInvitation' query type */
export interface ICreateArtistInvitationQuery {
  params: ICreateArtistInvitationParams;
  result: ICreateArtistInvitationResult;
}

const createArtistInvitationIR: any = {"usedParamSet":{"email":true,"stageName":true,"level":true,"setType":true,"customMessage":true,"tokenHash":true,"expiresAt":true,"invitedBy":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":353,"b":359}]},{"name":"stageName","required":true,"transform":{"type":"scalar"},"locs":[{"a":362,"b":372}]},{"name":"level","required":true,"transform":{"type":"scalar"},"locs":[{"a":375,"b":381}]},{"name":"setType","required":true,"transform":{"type":"scalar"},"locs":[{"a":384,"b":392}]},{"name":"customMessage","required":false,"transform":{"type":"scalar"},"locs":[{"a":395,"b":408}]},{"name":"tokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":413,"b":423}]},{"name":"expiresAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":426,"b":436}]},{"name":"invitedBy","required":true,"transform":{"type":"scalar"},"locs":[{"a":439,"b":449}]}],"statement":"-- Persists an admin-issued magic-link invitation. The plaintext token is never\n-- stored: only its SHA-256 hash is kept here, and the raw value is sent to the\n-- artist via email + shown once in the admin response.\nINSERT INTO artist_invitations (\n  email, stage_name, level, set_type, custom_message,\n  token_hash, expires_at, invited_by\n)\nVALUES (\n  :email!, :stageName!, :level!, :setType!, :customMessage,\n  :tokenHash!, :expiresAt!, :invitedBy!\n)\nRETURNING\n  id, email, stage_name, level, set_type, custom_message,\n  expires_at, status, artist_id, accepted_at,\n  last_resent_at, resend_count, created_at"};

/**
 * Query generated from SQL:
 * ```
 * -- Persists an admin-issued magic-link invitation. The plaintext token is never
 * -- stored: only its SHA-256 hash is kept here, and the raw value is sent to the
 * -- artist via email + shown once in the admin response.
 * INSERT INTO artist_invitations (
 *   email, stage_name, level, set_type, custom_message,
 *   token_hash, expires_at, invited_by
 * )
 * VALUES (
 *   :email!, :stageName!, :level!, :setType!, :customMessage,
 *   :tokenHash!, :expiresAt!, :invitedBy!
 * )
 * RETURNING
 *   id, email, stage_name, level, set_type, custom_message,
 *   expires_at, status, artist_id, accepted_at,
 *   last_resent_at, resend_count, created_at
 * ```
 */
export const createArtistInvitation = new PreparedQuery<ICreateArtistInvitationParams,ICreateArtistInvitationResult>(createArtistInvitationIR);


