/* @name deleteExample */
-- Soft delete example by ID
UPDATE examples
SET deleted_at = NOW()
WHERE example_id = :exampleId!
AND deleted_at IS NULL
RETURNING example_id
;
