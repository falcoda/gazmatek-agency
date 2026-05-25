/* @name getUserByEmail */
-- Get user by email
SELECT u.user_id, u.email
FROM users u
WHERE u.email = :email!;