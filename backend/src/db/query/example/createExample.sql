/* @name createExample */
-- Create new example
INSERT INTO examples(name, description)
VALUES(:name!, :description)
RETURNING example_id, name, description, created_at
;
