-- Seed (DEV ONLY): demo admin user. Never use in production.
-- Email: admin@example.com — demo password kept in the local dev notes (not committed).
-- Idempotent: re-running refreshes the hash and resets the account flags.
INSERT INTO admin_users (email, password_hash, full_name)
VALUES (
  'admin@example.com',
  '$argon2id$v=19$m=65536,t=3,p=4$4NP5zIXRkh0QMvxFHtBvKg$zYYA2Wa55aBJBdz3cjN7U9yM1wcvhEuUj4OEpdcNX5E',
  'Demo Admin'
)
ON CONFLICT (email) DO UPDATE
SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  is_active = TRUE,
  locked_until = NULL,
  failed_login_attempts = 0;
