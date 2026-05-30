/* @name insertAuditEvent */
INSERT INTO audit_log (actor_kind, actor_id, action, target_kind, target_id, metadata)
VALUES (:actorKind!, :actorId, :action!, :targetKind!, :targetId, :metadata)
RETURNING id
;
