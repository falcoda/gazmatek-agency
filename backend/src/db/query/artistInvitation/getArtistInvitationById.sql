/* @name getArtistInvitationById */
SELECT
  id, email, stage_name, level, set_type, custom_message,
  expires_at, status, artist_id, accepted_at,
  last_resent_at, resend_count, created_at
FROM artist_invitations
WHERE id = :invitationId!
LIMIT 1
;
