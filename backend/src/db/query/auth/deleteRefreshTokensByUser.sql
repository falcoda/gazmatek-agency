/* @name deleteRefreshTokensByUser */
DELETE FROM refresh_tokens
WHERE user_id = :userId!
RETURNING token_id;
