/* @name getClientAccountById */
SELECT id, email, display_name, is_active, claimed_at
FROM client_accounts
WHERE id = :clientId!
LIMIT 1
;
