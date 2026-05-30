/* @name getAdminById */
SELECT id, email, full_name, is_active
FROM admin_users
WHERE id = :adminId!
LIMIT 1
;
