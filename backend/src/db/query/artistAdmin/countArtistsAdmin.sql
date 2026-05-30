/* @name countArtistsAdmin */
SELECT COUNT(*)::int AS total
FROM artists
WHERE (:searchTerm::text IS NULL OR stage_name ILIKE '%' || :searchTerm::text || '%' OR slug ILIKE '%' || :searchTerm::text || '%')
;
