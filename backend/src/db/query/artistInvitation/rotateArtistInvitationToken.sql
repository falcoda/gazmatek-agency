/* @name rotateArtistInvitationToken */
-- Rotates the magic token on admin resend. Accepted/revoked invitations are
-- intentionally excluded — the WHERE clause guarantees we never reactivate
-- a closed invitation. Expired ones flip back to pending with the new TTL.
UPDATE artist_invitations
SET token_hash = :tokenHash!,
    expires_at = :expiresAt!,
    last_resent_at = NOW(),
    resend_count = resend_count + 1,
    status = 'pending'
WHERE id = :invitationId!
  AND status IN ('pending', 'expired')
RETURNING
  id, email, stage_name, level, set_type, custom_message,
  expires_at, status, resend_count, last_resent_at, created_at
;
