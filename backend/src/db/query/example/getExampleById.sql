/* @name getExampleById */
-- Get example by ID (excludes soft-deleted)
SELECT example_id, name, description, created_at
FROM examples
WHERE example_id = :exampleId!
AND deleted_at IS NULL
;
