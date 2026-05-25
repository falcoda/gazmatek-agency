INSERT INTO user_api_keys (user_id, api_key, is_active)
SELECT u.user_id, 'test-api-key', TRUE
FROM users u
WHERE u.email = 'template@example.com'
ON CONFLICT (api_key) DO NOTHING;