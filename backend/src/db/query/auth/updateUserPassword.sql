/* @name updateUserPassword */
UPDATE users
SET password_hash = :passwordHash!,
    updated_at = NOW()
WHERE user_id = :userId!
RETURNING user_id;
