/* @name completeArtistOnboarding */
UPDATE artists
SET onboarding_completed_at = NOW(),
    updated_at = NOW()
WHERE id = :artistId!
  AND onboarding_completed_at IS NULL
RETURNING id, onboarding_completed_at
;
