/* @name getArtistAccountById */
SELECT aa.artist_id, aa.email, aa.is_active,
       a.slug, a.stage_name
FROM artist_accounts aa
JOIN artists a ON a.id = aa.artist_id
WHERE aa.artist_id = :artistId!
LIMIT 1
;
