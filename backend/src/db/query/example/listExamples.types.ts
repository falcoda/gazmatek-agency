/** Types generated for queries found in "src/db/query/example/listExamples.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'ListExamples' parameters type */
export interface IListExamplesParams {
  limit: NumberOrString;
  offset: NumberOrString;
}

/** 'ListExamples' return type */
export interface IListExamplesResult {
  created_at: Date;
  description: string | null;
  example_id: string;
  name: string;
}

/** 'ListExamples' query type */
export interface IListExamplesQuery {
  params: IListExamplesParams;
  result: IListExamplesResult;
}

const listExamplesIR: any = {"usedParamSet":{"limit":true,"offset":true},"params":[{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":180,"b":186}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":195,"b":202}]}],"statement":"-- List all examples with pagination (excludes soft-deleted)\nSELECT example_id, name, description, created_at\nFROM examples\nWHERE deleted_at IS NULL\nORDER BY created_at DESC\nLIMIT :limit!\nOFFSET :offset!"};

/**
 * Query generated from SQL:
 * ```
 * -- List all examples with pagination (excludes soft-deleted)
 * SELECT example_id, name, description, created_at
 * FROM examples
 * WHERE deleted_at IS NULL
 * ORDER BY created_at DESC
 * LIMIT :limit!
 * OFFSET :offset!
 * ```
 */
export const listExamples = new PreparedQuery<IListExamplesParams,IListExamplesResult>(listExamplesIR);


