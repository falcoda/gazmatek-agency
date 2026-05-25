/* @name deleteRefreshToken */
-- Delete a refresh token (logout)
DELETE FROM refresh_tokens
WHERE token = :token!
RETURNING token_id;
