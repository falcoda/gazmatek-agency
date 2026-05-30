-- Seed: realistic test data for the demo artist `corentda`
-- (bookings spread across past/upcoming, unavailabilities).
-- Idempotent thanks to ON CONFLICT and date-based heuristics.

-- ── DEMO CLIENT STUBS ────────────────────────────────────────────────────
-- Booking rows reference `client_accounts` via FK; demo bookings need a stub
-- per client. They are unclaimed stubs (password_hash NULL, claimed_at NULL).
INSERT INTO client_accounts (id, email, display_name, phone, is_active)
VALUES
  ('33333333-3333-3333-3333-000000000001'::uuid, 'sarah.dubois@example.com',  'Sarah Dubois',   '+32475123456', TRUE),
  ('33333333-3333-3333-3333-000000000002'::uuid, 'leo.martin@example.com',    'Léo Martin',     '+33612345678', TRUE),
  ('33333333-3333-3333-3333-000000000003'::uuid, 'aicha.brand@example.com',   'Aïcha Brand',    '+32498765432', TRUE),
  ('33333333-3333-3333-3333-000000000004'::uuid, 'thomas.lefevre@example.com','Thomas Lefèvre', '+32477112233', TRUE),
  ('33333333-3333-3333-3333-000000000005'::uuid, 'marie.gauthier@example.com','Marie Gauthier', '+33687654321', TRUE),
  ('33333333-3333-3333-3333-000000000006'::uuid, 'noah.rover@example.com',    'Noah Rover',     NULL,           TRUE)
ON CONFLICT (id) DO NOTHING;

-- ── BOOKINGS ─────────────────────────────────────────────────────────────
-- `capacity`, `ticket_price_cents`, `set_type` are the pricing inputs that
-- drive computeArtistFee(level, capacity, ticketPrice, setType). They are
-- persisted alongside `quoted_total_cents` so the calculation can be replayed.
INSERT INTO bookings (
  id, artist_id, client_account_id, client_locale,
  event_date, event_duration_hours, event_location_address,
  event_context, capacity, ticket_price_cents, set_type,
  options, quoted_total_cents, deposit_amount_cents,
  status, admin_approved_at, validated_at, paid_at, created_at
)
SELECT
  '11111111-1111-1111-1111-000000000001'::uuid,
  a.id,
  '33333333-3333-3333-3333-000000000001'::uuid,
  'fr',
  NOW() + INTERVAL '14 days' + TIME '22:00',
  4.0,
  'Salle Le Botanique, Bruxelles',
  'Soirée d''ouverture de saison — set tekno underground 22h–02h.',
  450, 1500, 'dj',
  '[]'::jsonb,
  120000, 36000,
  'confirmed',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '7 days'
FROM artists a
WHERE a.slug = 'corentda'
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (
  id, artist_id, client_account_id, client_locale,
  event_date, event_duration_hours, event_location_address,
  event_context, capacity, ticket_price_cents, set_type,
  options, quoted_total_cents, deposit_amount_cents,
  status, admin_approved_at, validated_at, paid_at, created_at
)
SELECT
  '11111111-1111-1111-1111-000000000002'::uuid,
  a.id,
  '33333333-3333-3333-3333-000000000002'::uuid,
  'fr',
  NOW() + INTERVAL '32 days' + TIME '23:30',
  3.0,
  'Festival Open Tekno, Lille',
  'Set fermeture mainstage — 100% Acid Tekno.',
  1200, 2000, 'dj',
  '[]'::jsonb,
  95000, 28500,
  'awaiting_deposit',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days',
  NULL,
  NOW() - INTERVAL '3 days'
FROM artists a
WHERE a.slug = 'corentda'
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (
  id, artist_id, client_account_id, client_locale,
  event_date, event_duration_hours, event_location_address,
  event_context, capacity, ticket_price_cents, set_type,
  options, quoted_total_cents, deposit_amount_cents,
  status, created_at
)
SELECT
  '11111111-1111-1111-1111-000000000003'::uuid,
  a.id,
  '33333333-3333-3333-3333-000000000003'::uuid,
  'fr',
  NOW() + INTERVAL '58 days' + TIME '20:00',
  2.5,
  'Hangar 27, Anvers',
  'Showcase corporate — animation cocktail puis set tekno court.',
  250, 2500, 'hybrid',
  '[]'::jsonb,
  75000, 22500,
  'pending_validation',
  NOW() - INTERVAL '12 hours'
FROM artists a
WHERE a.slug = 'corentda'
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (
  id, artist_id, client_account_id, client_locale,
  event_date, event_duration_hours, event_location_address,
  event_context, capacity, ticket_price_cents, set_type,
  options, quoted_total_cents, deposit_amount_cents,
  status, admin_approved_at, validated_at, paid_at, created_at
)
SELECT
  '11111111-1111-1111-1111-000000000004'::uuid,
  a.id,
  '33333333-3333-3333-3333-000000000004'::uuid,
  'fr',
  NOW() - INTERVAL '21 days' + TIME '23:00',
  5.0,
  'Squat Le Charpentier, Liège',
  'Soirée free squat — 5h en B2B avec deux résidents Gazmatek.',
  600, 1000, 'dj',
  '[]'::jsonb,
  88000, 26400,
  'completed',
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '44 days',
  NOW() - INTERVAL '43 days',
  NOW() - INTERVAL '50 days'
FROM artists a
WHERE a.slug = 'corentda'
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (
  id, artist_id, client_account_id, client_locale,
  event_date, event_duration_hours, event_location_address,
  event_context, capacity, ticket_price_cents, set_type,
  options, quoted_total_cents, deposit_amount_cents,
  status, admin_approved_at, validated_at, paid_at, created_at
)
SELECT
  '11111111-1111-1111-1111-000000000005'::uuid,
  a.id,
  '33333333-3333-3333-3333-000000000005'::uuid,
  'fr',
  NOW() - INTERVAL '90 days' + TIME '22:00',
  3.5,
  'Le Bastion, Mons',
  'Anniversaire 30 ans — set vinyl uniquement.',
  150, 2000, 'dj',
  '[]'::jsonb,
  72000, 21600,
  'completed',
  NOW() - INTERVAL '120 days',
  NOW() - INTERVAL '119 days',
  NOW() - INTERVAL '118 days',
  NOW() - INTERVAL '125 days'
FROM artists a
WHERE a.slug = 'corentda'
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (
  id, artist_id, client_account_id, client_locale,
  event_date, event_duration_hours, event_location_address,
  event_context, capacity, ticket_price_cents, set_type,
  options, quoted_total_cents, deposit_amount_cents,
  status, cancel_reason, created_at
)
SELECT
  '11111111-1111-1111-1111-000000000006'::uuid,
  a.id,
  '33333333-3333-3333-3333-000000000006'::uuid,
  'fr',
  NOW() - INTERVAL '40 days' + TIME '21:30',
  4.0,
  'Salle privée, Charleroi',
  'Mariage privé annulé par le client (raisons familiales).',
  200, 1500, 'hybrid',
  '[]'::jsonb,
  98000, 0,
  'cancelled',
  'Annulation client à 30 jours, remboursement total accordé.',
  NOW() - INTERVAL '70 days'
FROM artists a
WHERE a.slug = 'corentda'
ON CONFLICT (id) DO NOTHING;

-- ── UNAVAILABILITIES ───────────────────────────────────────────────────
INSERT INTO artist_unavailabilities (
  id, artist_id, starts_at, ends_at, source,
  external_event_title, external_event_location, notes, created_by_kind
)
SELECT
  '22222222-2222-2222-2222-000000000001'::uuid,
  a.id,
  NOW() + INTERVAL '7 days' + TIME '20:00',
  NOW() + INTERVAL '7 days' + TIME '23:59',
  'external_gig',
  'Showcase Hardpsy Festival',
  'Antwerp, BE',
  'Engagement déjà signé via le promoteur — pas de demande Gazmatek possible.',
  'artist'
FROM artists a
WHERE a.slug = 'corentda'
ON CONFLICT (id) DO NOTHING;

INSERT INTO artist_unavailabilities (
  id, artist_id, starts_at, ends_at, source,
  external_event_title, notes, created_by_kind
)
SELECT
  '22222222-2222-2222-2222-000000000002'::uuid,
  a.id,
  NOW() + INTERVAL '20 days',
  NOW() + INTERVAL '24 days',
  'personal',
  NULL,
  'Vacances — pas de booking sur cette plage.',
  'artist'
FROM artists a
WHERE a.slug = 'corentda'
ON CONFLICT (id) DO NOTHING;

INSERT INTO artist_unavailabilities (
  id, artist_id, starts_at, ends_at, source,
  external_event_title, external_event_location, created_by_kind
)
SELECT
  '22222222-2222-2222-2222-000000000003'::uuid,
  a.id,
  NOW() + INTERVAL '45 days' + TIME '22:00',
  NOW() + INTERVAL '46 days' + TIME '04:00',
  'external_gig',
  'Pre-booked B2B Berlin',
  'Berlin, DE',
  'artist'
FROM artists a
WHERE a.slug = 'corentda'
ON CONFLICT (id) DO NOTHING;
