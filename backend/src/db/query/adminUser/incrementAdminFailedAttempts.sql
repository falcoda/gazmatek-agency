/* @name incrementAdminFailedAttempts */
UPDATE admin_users
SET failed_login_attempts = failed_login_attempts + 1,
    locked_until = CASE
      WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
      ELSE locked_until
    END
WHERE id = :adminId!
RETURNING failed_login_attempts
;
