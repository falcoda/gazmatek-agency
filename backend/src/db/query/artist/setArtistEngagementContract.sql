/* @name setArtistEngagementContract */
UPDATE artists
SET engagement_contract_id = :contractId!,
    updated_at = NOW()
WHERE id = :artistId!
RETURNING id, engagement_contract_id
;
