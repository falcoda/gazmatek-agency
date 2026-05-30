/* @name CreateIdentityRefreshToken */
INSERT INTO identity_refresh_tokens (kind, subject_id, token_hash, expires_at)
VALUES (:kind!, :subjectId!, :tokenHash!, :expiresAt!)
RETURNING id, kind, subject_id, token_hash, expires_at, created_at;
