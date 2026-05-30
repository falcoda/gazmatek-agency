/* @name resetArtistFailedAttempts */
UPDATE artist_accounts
SET failed_login_attempts = 0,
    locked_until = NULL,
    last_login_at = NOW()
WHERE artist_id = :artistId!
RETURNING artist_id
;
