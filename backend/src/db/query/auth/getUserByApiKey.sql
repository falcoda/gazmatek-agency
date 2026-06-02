/* @name getUserByApiKey */
-- Get active user by API key. `:apiKeyHash` is the SHA-256 hex digest of the
-- presented key (#15) — the column stores the hash, never the plaintext key.
SELECT u.user_id, u.email
FROM user_api_keys ak
JOIN users u ON u.user_id = ak.user_id
WHERE ak.api_key = :apiKeyHash!
  AND ak.is_active = TRUE;
