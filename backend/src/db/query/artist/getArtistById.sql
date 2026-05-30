/* @name getArtistById */
-- Fetch a single published artist by id.
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
  created_at,
  updated_at
FROM artists
WHERE id = :artistId!
  AND is_published = TRUE
;
