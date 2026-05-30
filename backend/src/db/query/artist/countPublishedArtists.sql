/* @name countPublishedArtists */
-- Counts published artists matching catalog filters.
SELECT COUNT(*)::int AS total
FROM artists
WHERE is_published = TRUE
  AND (:onlyFeatured::boolean IS NULL OR :onlyFeatured::boolean = FALSE OR is_featured = TRUE)
  AND (:genre::text IS NULL OR genre = :genre::text)
;
