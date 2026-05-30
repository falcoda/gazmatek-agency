/* @name countArtistInvitations */
SELECT COUNT(*)::int AS total
FROM artist_invitations
WHERE
  (:statusFilter::artist_invitation_status IS NULL
   OR status = :statusFilter::artist_invitation_status)
  AND (
    :searchTerm::text IS NULL
    OR email ILIKE '%' || :searchTerm::text || '%'
    OR stage_name ILIKE '%' || :searchTerm::text || '%'
  )
;
