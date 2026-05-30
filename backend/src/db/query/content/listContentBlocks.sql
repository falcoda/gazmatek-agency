/* @name listContentBlocks */
SELECT key, value_fr, value_nl, value_en, updated_at
FROM content_blocks
ORDER BY key ASC
;
