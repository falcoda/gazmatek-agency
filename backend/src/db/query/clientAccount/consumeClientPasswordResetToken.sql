/* @name consumeClientPasswordResetToken */
-- Used by both flows:
--   1. "Forgot password" — claimed_at is already set, password is just rotated.
--   2. "Claim invitation" (admin-created stub) — claimed_at is NULL and gets
--      set here, marking the account as activated.
UPDATE client_accounts
SET password_hash = :newPasswordHash!,
    password_reset_token_hash = NULL,
    password_reset_expires_at = NULL,
    failed_login_attempts = 0,
    locked_until = NULL,
    claimed_at = COALESCE(claimed_at, NOW())
WHERE password_reset_token_hash = :tokenHash!
  AND password_reset_expires_at > NOW()
RETURNING id, email, display_name
;
