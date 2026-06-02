-- #15 Store API keys as a SHA-256 hash instead of plaintext. The lookup path
-- (src/middleware/auth/strategies/apiKey.ts) now hashes the presented key with
-- hashToken() (sha256 hex) before querying, so existing plaintext rows must be
-- rehashed in place to keep working.
--
-- pgcrypto provides digest(); it is created if missing.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Rehash any row that still looks like plaintext. A SHA-256 hex digest is
-- exactly 64 lowercase hex chars, so we skip rows already in that shape to keep
-- the migration idempotent.
UPDATE user_api_keys
SET api_key = encode(digest(api_key, 'sha256'), 'hex'),
    updated_at = NOW()
WHERE api_key !~ '^[0-9a-f]{64}$';
