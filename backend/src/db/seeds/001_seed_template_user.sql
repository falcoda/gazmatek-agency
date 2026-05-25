INSERT INTO users (email, password_hash)
VALUES ('template@example.com', NULL)
ON CONFLICT (email) DO NOTHING;
