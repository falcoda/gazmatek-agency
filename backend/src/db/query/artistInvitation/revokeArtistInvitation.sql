/* @name revokeArtistInvitation */
UPDATE artist_invitations
SET status = 'revoked'
WHERE id = :invitationId!
  AND status IN ('pending', 'expired')
RETURNING id, status
;
