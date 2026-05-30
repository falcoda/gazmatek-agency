/* @name insertArtist */
INSERT INTO artists (
  slug, stage_name, bio_fr, bio_nl, bio_en,
  genre, is_published, is_featured, cover_image_url
)
VALUES (
  :slug!, :stageName!, :bioFr, :bioNl, :bioEn,
  :genre, :isPublished!, :isFeatured!, :coverImageUrl
)
RETURNING id, slug, stage_name, is_published, created_at
;
