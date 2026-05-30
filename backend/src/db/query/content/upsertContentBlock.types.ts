/** Types generated for queries found in "src/db/query/content/upsertContentBlock.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpsertContentBlock' parameters type */
export interface IUpsertContentBlockParams {
  key: string;
  updatedBy?: string | null | void;
  valueEn?: string | null | void;
  valueFr?: string | null | void;
  valueNl?: string | null | void;
}

/** 'UpsertContentBlock' return type */
export interface IUpsertContentBlockResult {
  key: string;
  updated_at: Date;
  value_en: string | null;
  value_fr: string | null;
  value_nl: string | null;
}

/** 'UpsertContentBlock' query type */
export interface IUpsertContentBlockQuery {
  params: IUpsertContentBlockParams;
  result: IUpsertContentBlockResult;
}

const upsertContentBlockIR: any = {"usedParamSet":{"key":true,"valueFr":true,"valueNl":true,"valueEn":true,"updatedBy":true},"params":[{"name":"key","required":true,"transform":{"type":"scalar"},"locs":[{"a":95,"b":99}]},{"name":"valueFr","required":false,"transform":{"type":"scalar"},"locs":[{"a":102,"b":109}]},{"name":"valueNl","required":false,"transform":{"type":"scalar"},"locs":[{"a":112,"b":119}]},{"name":"valueEn","required":false,"transform":{"type":"scalar"},"locs":[{"a":122,"b":129}]},{"name":"updatedBy","required":false,"transform":{"type":"scalar"},"locs":[{"a":132,"b":141}]}],"statement":"INSERT INTO content_blocks (key, value_fr, value_nl, value_en, updated_by, updated_at)\nVALUES (:key!, :valueFr, :valueNl, :valueEn, :updatedBy, NOW())\nON CONFLICT (key)\nDO UPDATE SET\n  value_fr = EXCLUDED.value_fr,\n  value_nl = EXCLUDED.value_nl,\n  value_en = EXCLUDED.value_en,\n  updated_by = EXCLUDED.updated_by,\n  updated_at = NOW()\nRETURNING key, value_fr, value_nl, value_en, updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO content_blocks (key, value_fr, value_nl, value_en, updated_by, updated_at)
 * VALUES (:key!, :valueFr, :valueNl, :valueEn, :updatedBy, NOW())
 * ON CONFLICT (key)
 * DO UPDATE SET
 *   value_fr = EXCLUDED.value_fr,
 *   value_nl = EXCLUDED.value_nl,
 *   value_en = EXCLUDED.value_en,
 *   updated_by = EXCLUDED.updated_by,
 *   updated_at = NOW()
 * RETURNING key, value_fr, value_nl, value_en, updated_at
 * ```
 */
export const upsertContentBlock = new PreparedQuery<IUpsertContentBlockParams,IUpsertContentBlockResult>(upsertContentBlockIR);


