/* @name listExamples */
-- List all examples with pagination (excludes soft-deleted)
SELECT example_id, name, description, created_at
FROM examples
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT :limit!
OFFSET :offset!
;
