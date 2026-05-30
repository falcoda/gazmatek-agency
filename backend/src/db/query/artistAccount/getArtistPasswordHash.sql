/* @name getArtistPasswordHash */
SELECT password_hash
FROM artist_accounts
WHERE artist_id = :artistId!
LIMIT 1
;
