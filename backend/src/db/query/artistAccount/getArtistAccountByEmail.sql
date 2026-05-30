/* @name getArtistAccountByEmail */
SELECT aa.artist_id, aa.email, aa.password_hash,
       aa.failed_login_attempts, aa.locked_until, aa.is_active,
       a.slug, a.stage_name
FROM artist_accounts aa
JOIN artists a ON a.id = aa.artist_id
WHERE aa.email = :email!
LIMIT 1
;
