/* @name getPasswordResetToken */
SELECT
  prt.token_id,
  prt.user_id,
  prt.token,
  prt.expires_at,
  prt.used_at,
  prt.created_at,
  u.email
FROM password_reset_tokens prt
JOIN users u ON u.user_id = prt.user_id
WHERE prt.token = :token!
  AND prt.used_at IS NULL
  AND prt.expires_at > NOW();
