/* @name createArtistInvitation */
-- Persists an admin-issued magic-link invitation. The plaintext token is never
-- stored: only its SHA-256 hash is kept here, and the raw value is sent to the
-- artist via email + shown once in the admin response.
INSERT INTO artist_invitations (
  email, stage_name, level, set_type, custom_message,
  token_hash, expires_at, invited_by
)
VALUES (
  :email!, :stageName!, :level!, :setType!, :customMessage,
  :tokenHash!, :expiresAt!, :invitedBy!
)
RETURNING
  id, email, stage_name, level, set_type, custom_message,
  expires_at, status, artist_id, accepted_at,
  last_resent_at, resend_count, created_at
;
