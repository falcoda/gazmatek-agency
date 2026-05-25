/* @name getUserByApiKey */
-- Get active user by API key
SELECT u.user_id, u.email
FROM user_api_keys ak
JOIN users u ON u.user_id = ak.user_id
WHERE ak.api_key = :apiKey!
  AND ak.is_active = TRUE;
