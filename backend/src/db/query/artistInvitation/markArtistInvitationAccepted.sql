/* @name markArtistInvitationAccepted */
-- Single-shot acceptance. The WHERE clause makes this safe against double
-- submits: a second call returns zero rows, letting the service raise a
-- ConflictError instead of creating duplicate artist/account rows.
UPDATE artist_invitations
SET status = 'accepted',
    accepted_at = NOW(),
    artist_id = :artistId!
WHERE id = :invitationId!
  AND status = 'pending'
RETURNING id, status, accepted_at
;
