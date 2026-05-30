/* @name listArtistPhotos */
-- Photos for a given artist, ordered by display position.
SELECT
  id,
  artist_id,
  url,
  alt_fr,
  alt_nl,
  alt_en,
  position
FROM artist_photos
WHERE artist_id = :artistId!
ORDER BY position ASC, created_at ASC
;
