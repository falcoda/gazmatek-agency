/** Types generated for queries found in "src/db/query/audit/insertAuditEvent.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'InsertAuditEvent' parameters type */
export interface IInsertAuditEventParams {
  action: string;
  actorId?: string | null | void;
  actorKind: string;
  metadata?: Json | null | void;
  targetId?: string | null | void;
  targetKind: string;
}

/** 'InsertAuditEvent' return type */
export interface IInsertAuditEventResult {
  id: string;
}

/** 'InsertAuditEvent' query type */
export interface IInsertAuditEventQuery {
  params: IInsertAuditEventParams;
  result: IInsertAuditEventResult;
}

const insertAuditEventIR: any = {"usedParamSet":{"actorKind":true,"actorId":true,"action":true,"targetKind":true,"targetId":true,"metadata":true},"params":[{"name":"actorKind","required":true,"transform":{"type":"scalar"},"locs":[{"a":95,"b":105}]},{"name":"actorId","required":false,"transform":{"type":"scalar"},"locs":[{"a":108,"b":115}]},{"name":"action","required":true,"transform":{"type":"scalar"},"locs":[{"a":118,"b":125}]},{"name":"targetKind","required":true,"transform":{"type":"scalar"},"locs":[{"a":128,"b":139}]},{"name":"targetId","required":false,"transform":{"type":"scalar"},"locs":[{"a":142,"b":150}]},{"name":"metadata","required":false,"transform":{"type":"scalar"},"locs":[{"a":153,"b":161}]}],"statement":"INSERT INTO audit_log (actor_kind, actor_id, action, target_kind, target_id, metadata)\nVALUES (:actorKind!, :actorId, :action!, :targetKind!, :targetId, :metadata)\nRETURNING id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO audit_log (actor_kind, actor_id, action, target_kind, target_id, metadata)
 * VALUES (:actorKind!, :actorId, :action!, :targetKind!, :targetId, :metadata)
 * RETURNING id
 * ```
 */
export const insertAuditEvent = new PreparedQuery<IInsertAuditEventParams,IInsertAuditEventResult>(insertAuditEventIR);


