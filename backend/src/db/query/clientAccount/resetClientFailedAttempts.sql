/* @name resetClientFailedAttempts */
UPDATE client_accounts
SET failed_login_attempts = 0,
    locked_until = NULL,
    last_login_at = NOW()
WHERE id = :clientId!
RETURNING id
;
