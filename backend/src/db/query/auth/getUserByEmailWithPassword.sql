/* @name getUserByEmailWithPassword */
-- Get user by email including password hash (for login)
SELECT u.user_id, u.email, u.password_hash
FROM users u
WHERE u.email = :email!;
