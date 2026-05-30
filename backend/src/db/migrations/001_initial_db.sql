-- Initial consolidated schema for the Gazmatek backend.
-- Replaces the previous 001-028 migration chain (nothing was in prod yet).
-- Subsequent schema changes must be added as new numbered migrations.

-- ─────────────────────────────────────────────────────────────────────────
-- Enumerated types
-- ─────────────────────────────────────────────────────────────────────────

CREATE TYPE booking_status AS ENUM (
  'pending_validation',
  'awaiting_deposit',
  'confirmed',
  'cancelled',
  'completed'
);

CREATE TYPE unavailability_source AS ENUM ('personal', 'external_gig');

CREATE TYPE contract_status AS ENUM (
  'draft',
  'pending_signature',
  'signed',
  'cancelled',
  'expired'
);

CREATE TYPE artist_invitation_status AS ENUM (
  'pending',
  'accepted',
  'expired',
  'revoked'
);

CREATE TYPE artist_level AS ENUM ('L1', 'L2', 'L3', 'L4');

CREATE TYPE artist_set_type AS ENUM ('dj', 'hybrid', 'live');

-- ─────────────────────────────────────────────────────────────────────────
-- Template tables (kept from the original backend scaffold)
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE users (
  user_id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_api_keys (
  api_key_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  api_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX idx_user_api_keys_active ON user_api_keys(is_active);

CREATE TABLE refresh_tokens (
  token_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

CREATE TABLE password_reset_tokens (
  token_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Admin / auth-side tables
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  password_reset_token_hash TEXT,
  password_reset_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_users_password_reset_token
  ON admin_users(password_reset_token_hash);

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_kind TEXT NOT NULL,
  actor_id UUID,
  action TEXT NOT NULL,
  target_kind TEXT NOT NULL,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_actor ON audit_log(actor_kind, actor_id, created_at DESC);
CREATE INDEX idx_audit_log_target ON audit_log(target_kind, target_id, created_at DESC);

CREATE TABLE content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value_fr TEXT,
  value_nl TEXT,
  value_en TEXT,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE slug_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_slug TEXT NOT NULL UNIQUE,
  to_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE identity_refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('admin', 'artist', 'client')),
  subject_id UUID NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_identity_refresh_kind_subject
  ON identity_refresh_tokens(kind, subject_id);
CREATE INDEX idx_identity_refresh_expires_at
  ON identity_refresh_tokens(expires_at);

-- ─────────────────────────────────────────────────────────────────────────
-- Agency singleton
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE agency_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id IS TRUE),
  signature_image_path TEXT,
  name TEXT,
  representative TEXT,
  address TEXT,
  company_number TEXT,
  vat_number TEXT,
  email TEXT,
  iban TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Artists
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  stage_name TEXT NOT NULL,
  bio_fr TEXT,
  bio_nl TEXT,
  bio_en TEXT,
  genre TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  cover_image_url TEXT,
  technical_info_fr TEXT,
  technical_info_nl TEXT,
  technical_info_en TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  level artist_level NOT NULL DEFAULT 'L2',
  full_name TEXT,
  phone TEXT,
  address TEXT,
  country TEXT,
  vat_number TEXT,
  company_number TEXT,
  supported_set_types artist_set_type[] NOT NULL
    DEFAULT ARRAY['dj']::artist_set_type[],
  onboarding_completed_at TIMESTAMPTZ,
  engagement_contract_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT artists_supported_set_types_non_empty
    CHECK (array_length(supported_set_types, 1) >= 1)
);

CREATE INDEX idx_artists_published_stage ON artists(is_published, stage_name);
CREATE INDEX idx_artists_featured ON artists(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_artists_genre ON artists(genre);

CREATE TABLE artist_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_fr TEXT,
  alt_nl TEXT,
  alt_en TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_artist_photos_artist ON artist_photos(artist_id, position);

CREATE TABLE artist_accounts (
  artist_id UUID PRIMARY KEY REFERENCES artists(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  last_login_at TIMESTAMPTZ,
  password_reset_token_hash TEXT,
  password_reset_expires_at TIMESTAMPTZ,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE artist_unavailabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  source unavailability_source NOT NULL,
  external_event_title TEXT,
  external_event_location TEXT,
  notes TEXT,
  created_by_kind TEXT NOT NULL DEFAULT 'artist',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX idx_unavail_artist
  ON artist_unavailabilities(artist_id, starts_at, ends_at);

CREATE TABLE artist_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  level TEXT NOT NULL,
  set_type TEXT NOT NULL,
  custom_message TEXT,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  status artist_invitation_status NOT NULL DEFAULT 'pending',
  invited_by UUID NOT NULL REFERENCES admin_users(id),
  artist_id UUID REFERENCES artists(id),
  accepted_at TIMESTAMPTZ,
  last_resent_at TIMESTAMPTZ,
  resend_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitation_token ON artist_invitations(token_hash);
CREATE INDEX idx_invitation_status ON artist_invitations(status);

-- ─────────────────────────────────────────────────────────────────────────
-- Clients
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE client_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  password_hash TEXT,
  display_name TEXT,
  password_reset_token_hash TEXT,
  password_reset_expires_at TIMESTAMPTZ,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  phone TEXT,
  company_name TEXT,
  company_number TEXT,
  vat_number TEXT,
  address_street TEXT,
  address_number TEXT,
  address_zip TEXT,
  address_city TEXT,
  address_country TEXT,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_accounts_reset_token
  ON client_accounts(password_reset_token_hash);

-- Partial unique index allows multiple email-less stubs.
CREATE UNIQUE INDEX client_accounts_email_unique
  ON client_accounts(email) WHERE email IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- Bookings + contracts
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id),
  client_account_id UUID REFERENCES client_accounts(id),
  client_locale TEXT NOT NULL DEFAULT 'fr',
  event_date TIMESTAMPTZ NOT NULL,
  event_duration_hours NUMERIC(4,1) NOT NULL,
  event_location_address TEXT NOT NULL,
  event_location_lat NUMERIC(9,6),
  event_location_lng NUMERIC(9,6),
  event_context TEXT,
  -- Pricing inputs captured from the public simulator. The agency-side quote
  -- (`quoted_total_cents`) is recomputed server-side from these via
  -- computeArtistFee(level, capacity, ticketPrice, setType) so admins can
  -- replay the calculation if the grid changes.
  capacity INTEGER NOT NULL CHECK (capacity >= 0),
  ticket_price_cents INTEGER NOT NULL CHECK (ticket_price_cents >= 0),
  set_type artist_set_type NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  quoted_total_cents INTEGER NOT NULL,
  deposit_amount_cents INTEGER NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending_validation',
  admin_approved_at TIMESTAMPTZ,
  validation_token_hash TEXT,
  validation_token_expires_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,
  cancel_reason TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_artist_date ON bookings(artist_id, event_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_validation_token ON bookings(validation_token_hash);
CREATE INDEX idx_bookings_client_account ON bookings(client_account_id);

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id),
  kind TEXT NOT NULL DEFAULT 'booking',
  template_version TEXT NOT NULL DEFAULT 'v1',
  pdf_storage_key TEXT NOT NULL,
  status contract_status NOT NULL DEFAULT 'draft',
  signature_provider TEXT,
  signature_provider_envelope_id TEXT,
  signed_at TIMESTAMPTZ,
  signed_pdf_storage_key TEXT,
  last_reminder_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contract_kind_check CHECK (
    (kind = 'booking' AND booking_id IS NOT NULL) OR
    (kind = 'engagement' AND artist_id IS NOT NULL)
  )
);

CREATE INDEX idx_contracts_status ON contracts(status);

-- Late-binding FK now that contracts exists.
ALTER TABLE artists
  ADD CONSTRAINT artists_engagement_contract_fk
  FOREIGN KEY (engagement_contract_id) REFERENCES contracts(id);

-- ─────────────────────────────────────────────────────────────────────────
-- Outbound emails
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE email_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template TEXT NOT NULL,
  recipient TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'fr',
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_retry ON email_deliveries(status, next_retry_at);

-- ─────────────────────────────────────────────────────────────────────────
-- Bootstrap rows (idempotent — preserved from the old migrations)
-- ─────────────────────────────────────────────────────────────────────────

-- Singleton agency_settings row so SELECT/UPDATE queries can rely on it.
INSERT INTO agency_settings (id, name, representative)
VALUES (TRUE, 'Gazmatek Universe Booking', 'Thomas Gozes')
ON CONFLICT (id) DO NOTHING;

-- Admin bootstrap is intentionally NOT performed in this migration.
-- Migrations run in every environment (including production), so no
-- credential must ever be committed here. Provision the first admin out
-- of band: dev via seeds (npm run db:seed); prod via a row whose password
-- hash comes from a secret kept outside the repository.
