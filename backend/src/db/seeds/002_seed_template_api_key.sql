-- Seed (DEV ONLY): template API key. The raw key is `test-api-key`; the column
-- stores its SHA-256 hash (#15) so the api-key strategy can look it up by hash.
-- pgcrypto provides digest(); created if missing.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO user_api_keys (user_id, api_key, is_active)
SELECT u.user_id, encode(digest('test-api-key', 'sha256'), 'hex'), TRUE
FROM users u
WHERE u.email = 'template@example.com'
ON CONFLICT (api_key) DO NOTHING;
