/* @name setArtistPasswordResetToken */
UPDATE artist_accounts
SET password_reset_token_hash = :tokenHash!,
    password_reset_expires_at = :expiresAt!
WHERE email = :email!
RETURNING artist_id
;
