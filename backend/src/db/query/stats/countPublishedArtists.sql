/* @name countPublishedArtistsStats */
-- Total published artists in the roster (no filters), used by the home hero.
SELECT COUNT(*)::int AS total
FROM artists
WHERE is_published = TRUE
;
