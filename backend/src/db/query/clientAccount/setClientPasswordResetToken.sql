/* @name setClientPasswordResetToken */
UPDATE client_accounts
SET password_reset_token_hash = :tokenHash!,
    password_reset_expires_at = :expiresAt!
WHERE email = :email!
RETURNING id
;
