/* @name RevokeIdentityRefreshToken */
UPDATE identity_refresh_tokens
SET revoked_at = NOW()
WHERE token_hash = :tokenHash!
  AND revoked_at IS NULL;
