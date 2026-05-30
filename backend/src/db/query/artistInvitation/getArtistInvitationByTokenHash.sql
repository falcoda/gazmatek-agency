/* @name getArtistInvitationByTokenHash */
-- Looks up an invitation by token hash. Returns the row regardless of status:
-- the service layer decides whether to expose details (pending+unexpired) or
-- surface an "invalid" error to the public endpoint.
SELECT
  id, email, stage_name, level, set_type, custom_message,
  expires_at, status, artist_id, accepted_at, created_at
FROM artist_invitations
WHERE token_hash = :tokenHash!
LIMIT 1
;
