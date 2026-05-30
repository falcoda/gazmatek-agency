/* @name updateArtistSelfProfile */
UPDATE artists
SET bio_fr = COALESCE(:bioFr, bio_fr),
    bio_nl = COALESCE(:bioNl, bio_nl),
    bio_en = COALESCE(:bioEn, bio_en),
    technical_info_fr = COALESCE(:technicalInfoFr, technical_info_fr),
    technical_info_nl = COALESCE(:technicalInfoNl, technical_info_nl),
    technical_info_en = COALESCE(:technicalInfoEn, technical_info_en),
    social_links = COALESCE(:socialLinks, social_links),
    cover_image_url = COALESCE(:coverImageUrl, cover_image_url),
    full_name = COALESCE(:fullName, full_name),
    phone = COALESCE(:phone, phone),
    address = COALESCE(:address, address),
    country = COALESCE(:country, country),
    vat_number = COALESCE(:vatNumber, vat_number),
    company_number = COALESCE(:companyNumber, company_number),
    updated_at = NOW()
WHERE id = :artistId!
RETURNING id, slug, stage_name, bio_fr, bio_nl, bio_en,
          technical_info_fr, technical_info_nl, technical_info_en,
          social_links, cover_image_url, genre,
          full_name, phone,
          address, country, vat_number, company_number,
          onboarding_completed_at
;
