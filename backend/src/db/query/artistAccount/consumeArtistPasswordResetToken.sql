/* @name consumeArtistPasswordResetToken */
UPDATE artist_accounts
SET password_hash = :newPasswordHash!,
    password_reset_token_hash = NULL,
    password_reset_expires_at = NULL,
    failed_login_attempts = 0,
    locked_until = NULL
WHERE password_reset_token_hash = :tokenHash!
  AND password_reset_expires_at > NOW()
RETURNING artist_id
;
