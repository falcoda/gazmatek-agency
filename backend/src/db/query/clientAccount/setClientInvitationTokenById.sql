/* @name setClientInvitationTokenById */
-- Sets a single-use token an admin can email to a stub client so they can set
-- their password and claim the account. Reuses the existing password_reset_*
-- columns since the underlying mechanic is the same (consumeClientPasswordResetToken
-- finalizes both flows).
UPDATE client_accounts
SET password_reset_token_hash = :tokenHash!,
    password_reset_expires_at = :expiresAt!
WHERE id = :clientId!
RETURNING id, email, display_name
;
