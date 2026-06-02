import pool from "@src/db/dbConnect";
import { insertAuditEvent } from "@src/db/query/audit/insertAuditEvent.types";
import type {
  AuditAction,
  AuditActorKind,
  AuditTargetKind,
} from "@src/helpers/constants/domain";
import { logger } from "@src/helpers/logger";
import type { Pool, PoolClient } from "pg";

export interface AuditEventInput {
  actorKind: AuditActorKind;
  actorId?: string | null;
  action: AuditAction;
  targetKind: AuditTargetKind;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Record an audit event. Pass `connection` (a transaction client) when the audit
 * write must be atomic with surrounding work — in that case a failure propagates
 * so the transaction rolls back, instead of being swallowed. Without a
 * connection the write is best-effort against the shared pool.
 */
export async function recordAudit(
  event: AuditEventInput,
  connection?: Pool | PoolClient,
): Promise<void> {
  const run = () =>
    insertAuditEvent.run(
      {
        actorKind: event.actorKind,
        actorId: event.actorId ?? null,
        action: event.action,
        targetKind: event.targetKind,
        targetId: event.targetId ?? null,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
      },
      connection ?? pool,
    );

  if (connection) {
    // Inside a transaction: let failures propagate so the caller can roll back.
    await run();
    return;
  }

  try {
    await run();
  } catch (error) {
    logger.warn("Audit log insert failed", {
      action: event.action,
      error: (error as Error).message,
    });
  }
}
