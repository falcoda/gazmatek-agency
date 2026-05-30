/* @name getArtistAdminById */
SELECT id, slug, stage_name, bio_fr, bio_nl, bio_en,
       genre,
       is_published, is_featured, cover_image_url, level,
       created_at, updated_at
FROM artists
WHERE id = :artistId!
;
