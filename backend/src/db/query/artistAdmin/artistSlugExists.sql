/* @name artistSlugExists */
SELECT EXISTS(SELECT 1 FROM artists WHERE slug = :slug!) AS slug_exists
;
