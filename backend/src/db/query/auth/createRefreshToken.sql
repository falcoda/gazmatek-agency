/* @name createRefreshToken */
-- Store a new refresh token for a user
INSERT INTO refresh_tokens (user_id, token, expires_at)
VALUES (:userId!, :token!, :expiresAt!)
RETURNING token_id, token, expires_at;
