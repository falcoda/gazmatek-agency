/* @name createArtistAccount */
INSERT INTO artist_accounts (artist_id, email, password_hash)
VALUES (:artistId!, :email!, :passwordHash!)
RETURNING artist_id, email, created_at
;
