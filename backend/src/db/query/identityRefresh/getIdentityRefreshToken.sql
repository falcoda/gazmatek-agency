/* @name GetIdentityRefreshToken */
SELECT id, kind, subject_id, token_hash, expires_at, revoked_at
FROM identity_refresh_tokens
WHERE token_hash = :tokenHash!
  AND revoked_at IS NULL
  AND expires_at > NOW();
