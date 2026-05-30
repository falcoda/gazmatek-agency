/* @name getArtistSelfProfile */
SELECT id, slug, stage_name, bio_fr, bio_nl, bio_en,
       technical_info_fr, technical_info_nl, technical_info_en,
       social_links, cover_image_url, genre,
       full_name, phone,
       address, country, vat_number, company_number,
       onboarding_completed_at
FROM artists
WHERE id = :artistId!
;
