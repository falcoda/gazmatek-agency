/* @name listUnavailabilitiesInRange */
SELECT id, artist_id, starts_at, ends_at, source,
       external_event_title, external_event_location, notes, created_at
FROM artist_unavailabilities
WHERE artist_id = :artistId!
  AND tstzrange(starts_at, ends_at, '[)') && tstzrange(:rangeStart!, :rangeEnd!, '[)')
ORDER BY starts_at ASC
;
