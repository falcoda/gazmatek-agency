/* @name getClientAccountByEmail */
SELECT id, email, password_hash, display_name,
       claimed_at,
       failed_login_attempts, locked_until, is_active
FROM client_accounts
WHERE email = :email!
LIMIT 1
;
