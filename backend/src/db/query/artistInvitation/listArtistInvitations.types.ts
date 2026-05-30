/** Types generated for queries found in "src/db/query/artistInvitation/listArtistInvitations.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_invitation_status = 'accepted' | 'expired' | 'pending' | 'revoked';

export type NumberOrString = number | string;

/** 'ListArtistInvitations' parameters type */
export interface IListArtistInvitationsParams {
  pageLimit: NumberOrString;
  pageOffset: NumberOrString;
  searchTerm?: string | null | void;
  statusFilter?: artist_invitation_status | null | void;
}

/** 'ListArtistInvitations' return type */
export interface IListArtistInvitationsResult {
  accepted_at: Date | null;
  artist_id: string | null;
  created_at: Date;
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

/** 'ListArtistInvitations' query type */
export interface IListArtistInvitationsQuery {
  params: IListArtistInvitationsParams;
  result: IListArtistInvitationsResult;
}

const listArtistInvitationsIR: any = {"usedParamSet":{"statusFilter":true,"searchTerm":true,"pageLimit":true,"pageOffset":true},"params":[{"name":"statusFilter","required":false,"transform":{"type":"scalar"},"locs":[{"a":171,"b":183},{"a":234,"b":246}]},{"name":"searchTerm","required":false,"transform":{"type":"scalar"},"locs":[{"a":287,"b":297},{"a":339,"b":349},{"a":395,"b":405}]},{"name":"pageLimit","required":true,"transform":{"type":"scalar"},"locs":[{"a":455,"b":465}]},{"name":"pageOffset","required":true,"transform":{"type":"scalar"},"locs":[{"a":474,"b":485}]}],"statement":"SELECT\n  id, email, stage_name, level, set_type,\n  expires_at, status, artist_id, accepted_at,\n  last_resent_at, resend_count, created_at\nFROM artist_invitations\nWHERE\n  (:statusFilter::artist_invitation_status IS NULL\n   OR status = :statusFilter::artist_invitation_status)\n  AND (\n    :searchTerm::text IS NULL\n    OR email ILIKE '%' || :searchTerm::text || '%'\n    OR stage_name ILIKE '%' || :searchTerm::text || '%'\n  )\nORDER BY created_at DESC\nLIMIT :pageLimit!\nOFFSET :pageOffset!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id, email, stage_name, level, set_type,
 *   expires_at, status, artist_id, accepted_at,
 *   last_resent_at, resend_count, created_at
 * FROM artist_invitations
 * WHERE
 *   (:statusFilter::artist_invitation_status IS NULL
 *    OR status = :statusFilter::artist_invitation_status)
 *   AND (
 *     :searchTerm::text IS NULL
 *     OR email ILIKE '%' || :searchTerm::text || '%'
 *     OR stage_name ILIKE '%' || :searchTerm::text || '%'
 *   )
 * ORDER BY created_at DESC
 * LIMIT :pageLimit!
 * OFFSET :pageOffset!
 * ```
 */
export const listArtistInvitations = new PreparedQuery<IListArtistInvitationsParams,IListArtistInvitationsResult>(listArtistInvitationsIR);


