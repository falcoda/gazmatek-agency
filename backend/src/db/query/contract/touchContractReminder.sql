/* @name touchContractReminder */
UPDATE contracts
SET last_reminder_at = NOW(),
    updated_at = NOW()
WHERE id = :contractId!
  AND (last_reminder_at IS NULL OR last_reminder_at < NOW() - INTERVAL '24 hours')
RETURNING id, last_reminder_at
;
