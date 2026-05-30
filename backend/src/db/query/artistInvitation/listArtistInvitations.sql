/* @name listArtistInvitations */
SELECT
  id, email, stage_name, level, set_type,
  expires_at, status, artist_id, accepted_at,
  last_resent_at, resend_count, created_at
FROM artist_invitations
WHERE
  (:statusFilter::artist_invitation_status IS NULL
   OR status = :statusFilter::artist_invitation_status)
  AND (
    :searchTerm::text IS NULL
    OR email ILIKE '%' || :searchTerm::text || '%'
    OR stage_name ILIKE '%' || :searchTerm::text || '%'
  )
ORDER BY created_at DESC
LIMIT :pageLimit!
OFFSET :pageOffset!
;
