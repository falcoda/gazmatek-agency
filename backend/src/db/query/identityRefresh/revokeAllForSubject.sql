/* @name RevokeAllIdentityRefreshTokensForSubject */
UPDATE identity_refresh_tokens
SET revoked_at = NOW()
WHERE kind = :kind!
  AND subject_id = :subjectId!
  AND revoked_at IS NULL;
