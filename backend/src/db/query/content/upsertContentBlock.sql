/* @name upsertContentBlock */
INSERT INTO content_blocks (key, value_fr, value_nl, value_en, updated_by, updated_at)
VALUES (:key!, :valueFr, :valueNl, :valueEn, :updatedBy, NOW())
ON CONFLICT (key)
DO UPDATE SET
  value_fr = EXCLUDED.value_fr,
  value_nl = EXCLUDED.value_nl,
  value_en = EXCLUDED.value_en,
  updated_by = EXCLUDED.updated_by,
  updated_at = NOW()
RETURNING key, value_fr, value_nl, value_en, updated_at
;
