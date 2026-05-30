/* @name listArtistsWithFilters */
-- List published artists with optional filters: genre, price range, featured-only.
SELECT
  id,
  slug,
  stage_name,
  bio_fr,
  bio_nl,
  bio_en,
  genre,
  is_featured,
  cover_image_url,
  level,
  supported_set_types,
  created_at,
  updated_at
FROM artists
WHERE is_published = TRUE
  AND (:onlyFeatured::boolean IS NULL OR :onlyFeatured::boolean = FALSE OR is_featured = TRUE)
  AND (:genre::text IS NULL OR genre = :genre::text)
ORDER BY is_featured DESC, stage_name ASC
LIMIT :pageLimit!
OFFSET :pageOffset!
;
