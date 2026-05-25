/* @name getRefreshToken */
-- Get a valid (non-expired) refresh token and its user
SELECT rt.token_id, rt.user_id, rt.token, rt.expires_at,
       u.email
FROM refresh_tokens rt
JOIN users u ON u.user_id = rt.user_id
WHERE rt.token = :token!
AND rt.expires_at > NOW();
