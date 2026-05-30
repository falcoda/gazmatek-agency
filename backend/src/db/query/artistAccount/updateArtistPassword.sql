/* @name updateArtistPassword */
UPDATE artist_accounts
SET password_hash = :newPasswordHash!
WHERE artist_id = :artistId!
RETURNING artist_id
;
