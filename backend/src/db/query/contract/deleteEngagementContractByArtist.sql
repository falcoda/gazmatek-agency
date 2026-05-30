/* @name deleteEngagementContractByArtist */
DELETE FROM contracts
WHERE artist_id = :artistId!
  AND kind = 'engagement'
RETURNING id
;
