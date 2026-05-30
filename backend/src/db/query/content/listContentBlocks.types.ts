/** Types generated for queries found in "src/db/query/content/listContentBlocks.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ListContentBlocks' parameters type */
export type IListContentBlocksParams = void;

/** 'ListContentBlocks' return type */
export interface IListContentBlocksResult {
  key: string;
  updated_at: Date;
  value_en: string | null;
  value_fr: string | null;
  value_nl: string | null;
}

/** 'ListContentBlocks' query type */
export interface IListContentBlocksQuery {
  params: IListContentBlocksParams;
  result: IListContentBlocksResult;
}

const listContentBlocksIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT key, value_fr, value_nl, value_en, updated_at\nFROM content_blocks\nORDER BY key ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT key, value_fr, value_nl, value_en, updated_at
 * FROM content_blocks
 * ORDER BY key ASC
 * ```
 */
export const listContentBlocks = new PreparedQuery<IListContentBlocksParams,IListContentBlocksResult>(listContentBlocksIR);


