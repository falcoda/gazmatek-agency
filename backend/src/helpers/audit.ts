import pool from "@src/db/dbConnect";
import { insertAuditEvent } from "@src/db/query/audit/insertAuditEvent.types";
import type {
  AuditAction,
  AuditActorKind,
  AuditTargetKind,
} from "@src/helpers/constants/domain";
import { logger } from "@src/helpers/logger";

export interface AuditEventInput {
  actorKind: AuditActorKind;
  actorId?: string | null;
  action: AuditAction;
  targetKind: AuditTargetKind;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function recordAudit(event: AuditEventInput): Promise<void> {
  try {
    await insertAuditEvent.run(
      {
        actorKind: event.actorKind,
        actorId: event.actorId ?? null,
        action: event.action,
        targetKind: event.targetKind,
        targetId: event.targetId ?? null,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
      },
      pool,
    );
  } catch (error) {
    logger.warn("Audit log insert failed", {
      action: event.action,
      error: (error as Error).message,
    });
  }
}
