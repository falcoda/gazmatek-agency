-- Seed (DEV ONLY): demo artist + artist account. Never use in production.
-- Email: artist@example.com — demo password kept in the local dev notes (not committed).
-- Creates an artist profile and its login account to test the artist area.

INSERT INTO artists (
  slug, stage_name, level, set_type, base_fee_cents,
  genre, bio_fr, bio_nl, bio_en, is_published, is_featured, cover_image_url
)
VALUES (
  'corentda',
  'Demo Artist',
  'L2',
  'dj',
  150000,
  'dj',
  'Artiste démo — utilisé pour tester la partie artiste de la plateforme.',
  'Demo-artiest — gebruikt om de artiestenzone van het platform te testen.',
  'Demo artist — used to test the artist side of the platform.',
  TRUE,
  TRUE,
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO artist_accounts (artist_id, email, password_hash)
SELECT a.id,
       'artist@example.com',
       '$argon2id$v=19$m=65536,t=3,p=4$QesN8+hE9FLsDHriAA6jOQ$NMVdS1gV8OkQ5majfpHORQ+cHTy85J0p1Dw7T7dfAFk'
FROM artists a
WHERE a.slug = 'corentda'
ON CONFLICT (artist_id) DO NOTHING;
