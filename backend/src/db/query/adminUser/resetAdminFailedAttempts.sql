/* @name resetAdminFailedAttempts */
UPDATE admin_users
SET failed_login_attempts = 0,
    locked_until = NULL,
    last_login_at = NOW()
WHERE id = :adminId!
RETURNING id
;
