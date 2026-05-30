/* @name getUnavailabilityById */
SELECT id, artist_id, starts_at, ends_at, source,
       external_event_title, external_event_location, notes,
       created_by_kind, created_by, created_at
FROM artist_unavailabilities
WHERE id = :unavailabilityId!
;
