/* @name createUnavailability */
INSERT INTO artist_unavailabilities (
  artist_id, starts_at, ends_at, source,
  external_event_title, external_event_location, notes,
  created_by_kind, created_by
)
VALUES (
  :artistId!, :startsAt!, :endsAt!, :source!,
  :externalEventTitle, :externalEventLocation, :notes,
  :createdByKind!, :createdBy
)
RETURNING id, artist_id, starts_at, ends_at, source,
          external_event_title, external_event_location, notes, created_at
;
