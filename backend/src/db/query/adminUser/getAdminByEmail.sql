/* @name getAdminByEmail */
SELECT id, email, password_hash, full_name, is_active,
       failed_login_attempts, locked_until
FROM admin_users
WHERE email = :email!
LIMIT 1
;
