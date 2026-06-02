/* @name GetIdentityRefreshTokenAny */
-- #21 Reuse detection: unlike getIdentityRefreshToken, this returns a row even
-- when it has already been revoked (but not yet expired). A presented token that
-- exists but is revoked means the (rotated, single-use) token was replayed —
-- treated as theft, triggering a full session revoke for the subject.
SELECT id, kind, subject_id, token_hash, expires_at, revoked_at
FROM identity_refresh_tokens
WHERE token_hash = :tokenHash!
  AND expires_at > NOW();
