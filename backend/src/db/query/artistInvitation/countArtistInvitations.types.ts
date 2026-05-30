/** Types generated for queries found in "src/db/query/artistInvitation/countArtistInvitations.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type artist_invitation_status = 'accepted' | 'expired' | 'pending' | 'revoked';

/** 'CountArtistInvitations' parameters type */
export interface ICountArtistInvitationsParams {
  searchTerm?: string | null | void;
  statusFilter?: artist_invitation_status | null | void;
}

/** 'CountArtistInvitations' return type */
export interface ICountArtistInvitationsResult {
  total: number | null;
}

/** 'CountArtistInvitations' query type */
export interface ICountArtistInvitationsQuery {
  params: ICountArtistInvitationsParams;
  result: ICountArtistInvitationsResult;
}

const countArtistInvitationsIR: any = {"usedParamSet":{"statusFilter":true,"searchTerm":true},"params":[{"name":"statusFilter","required":false,"transform":{"type":"scalar"},"locs":[{"a":63,"b":75},{"a":126,"b":138}]},{"name":"searchTerm","required":false,"transform":{"type":"scalar"},"locs":[{"a":179,"b":189},{"a":231,"b":241},{"a":287,"b":297}]}],"statement":"SELECT COUNT(*)::int AS total\nFROM artist_invitations\nWHERE\n  (:statusFilter::artist_invitation_status IS NULL\n   OR status = :statusFilter::artist_invitation_status)\n  AND (\n    :searchTerm::text IS NULL\n    OR email ILIKE '%' || :searchTerm::text || '%'\n    OR stage_name ILIKE '%' || :searchTerm::text || '%'\n  )"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT(*)::int AS total
 * FROM artist_invitations
 * WHERE
 *   (:statusFilter::artist_invitation_status IS NULL
 *    OR status = :statusFilter::artist_invitation_status)
 *   AND (
 *     :searchTerm::text IS NULL
 *     OR email ILIKE '%' || :searchTerm::text || '%'
 *     OR stage_name ILIKE '%' || :searchTerm::text || '%'
 *   )
 * ```
 */
export const countArtistInvitations = new PreparedQuery<ICountArtistInvitationsParams,ICountArtistInvitationsResult>(countArtistInvitationsIR);


