/* @name getArtistBySlug */
-- Fetch a single published artist by its public slug.
SELECT
  id,
  slug,
  stage_name,
  bio_fr,
  bio_nl,
  bio_en,
  genre,
  is_featured,
  is_published,
  cover_image_url,
  level,
  supported_set_types,
  created_at,
  updated_at
FROM artists
WHERE slug = :slug!
  AND is_published = TRUE
;
