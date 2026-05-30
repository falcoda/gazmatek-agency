/* @name deleteUnavailability */
DELETE FROM artist_unavailabilities
WHERE id = :unavailabilityId!
  AND (:enforceArtistId::boolean = FALSE OR artist_id = :artistId!)
RETURNING id
;
