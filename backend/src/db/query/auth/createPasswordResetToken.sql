/* @name createPasswordResetToken */
INSERT INTO password_reset_tokens (user_id, token, expires_at)
VALUES (:userId!, :token!, :expiresAt!)
RETURNING token_id, user_id, token, expires_at, used_at, created_at;
