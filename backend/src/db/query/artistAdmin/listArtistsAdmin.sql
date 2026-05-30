/* @name listArtistsAdmin */
SELECT id, slug, stage_name,
       genre, is_published, is_featured, cover_image_url, level,
       created_at, updated_at
FROM artists
WHERE (:searchTerm::text IS NULL OR stage_name ILIKE '%' || :searchTerm::text || '%' OR slug ILIKE '%' || :searchTerm::text || '%')
ORDER BY created_at DESC
LIMIT :pageLimit!
OFFSET :pageOffset!
;
