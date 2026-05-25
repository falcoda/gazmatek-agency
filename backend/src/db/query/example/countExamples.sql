/* @name countExamples */
-- Count all non-deleted examples
SELECT COUNT(*)::int AS total
FROM examples
WHERE deleted_at IS NULL;
