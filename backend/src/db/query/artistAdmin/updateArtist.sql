/* @name updateArtist */
UPDATE artists
SET slug = COALESCE(:slug, slug),
    stage_name = COALESCE(:stageName, stage_name),
    bio_fr = COALESCE(:bioFr, bio_fr),
    bio_nl = COALESCE(:bioNl, bio_nl),
    bio_en = COALESCE(:bioEn, bio_en),
    genre = COALESCE(:genre, genre),
    is_published = COALESCE(:isPublished, is_published),
    is_featured = COALESCE(:isFeatured, is_featured),
    cover_image_url = COALESCE(:coverImageUrl, cover_image_url),
    level = COALESCE(:level::artist_level, level),
    updated_at = NOW()
WHERE id = :artistId!
RETURNING id, slug, stage_name, is_published, updated_at
;
