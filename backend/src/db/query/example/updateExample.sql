/* @name updateExample */
-- Update example
UPDATE examples
SET name = :name, description = :description
WHERE example_id = :exampleId!
RETURNING example_id, name, description, created_at
;
