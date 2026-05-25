CREATE TABLE IF NOT EXISTS refresh_tokens (
  token_id  BIGSERIAL PRIMARY KEY,
  user_id   BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token     TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
