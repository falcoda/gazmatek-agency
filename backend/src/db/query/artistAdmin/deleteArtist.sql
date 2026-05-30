/* @name deleteArtist */
DELETE FROM artists
WHERE id = :artistId!
RETURNING id
;
