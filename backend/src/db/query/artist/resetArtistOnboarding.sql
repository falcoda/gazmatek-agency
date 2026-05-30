/* @name resetArtistOnboarding */
UPDATE artists
SET engagement_contract_id = NULL,
    onboarding_completed_at = NULL,
    updated_at = NOW()
WHERE id = :artistId!
RETURNING id
;
