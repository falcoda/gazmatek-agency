/* @name insertEngagementContract */
INSERT INTO contracts (artist_id, kind, pdf_storage_key, status, template_version)
VALUES (:artistId!, 'engagement', :pdfStorageKey!, 'draft', :templateVersion!)
RETURNING id, artist_id, pdf_storage_key, status, signed_at, signed_pdf_storage_key,
          created_at, updated_at
;
