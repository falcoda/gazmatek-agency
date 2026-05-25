/* @name markPasswordResetTokenUsed */
UPDATE password_reset_tokens
SET used_at = NOW()
WHERE token = :token!
RETURNING token_id;
