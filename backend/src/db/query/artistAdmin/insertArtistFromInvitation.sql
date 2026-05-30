/* @name insertArtistFromInvitation */
-- Inserts a minimal artist row on invitation acceptance. The admin still has
-- to fill bio/photos from the back-office — this is intentionally the
-- smallest viable artist so the magic-link flow can finish in one click.
INSERT INTO artists (
  slug, stage_name,
  level, supported_set_types, is_published, is_featured
)
VALUES (
  :slug!, :stageName!,
  :level!,
  ARRAY[:setType!::artist_set_type],
  FALSE, FALSE
)
RETURNING id, slug, stage_name
;
