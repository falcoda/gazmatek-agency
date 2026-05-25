/* @name createUser */
-- Create a new user with hashed password
INSERT INTO users (email, password_hash)
VALUES (:email!, :passwordHash!)
RETURNING user_id, email, created_at;
