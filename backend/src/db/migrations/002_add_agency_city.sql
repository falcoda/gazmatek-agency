-- Agency city, prefilled as the "Signed in:" place on engagement contracts.
ALTER TABLE agency_settings
  ADD COLUMN IF NOT EXISTS city TEXT;
