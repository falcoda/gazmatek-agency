/** Types generated for queries found in "src/db/query/example/updateExample.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'UpdateExample' parameters type */
export interface IUpdateExampleParams {
  description?: string | null | void;
  exampleId: NumberOrString;
  name?: string | null | void;
}

/** 'UpdateExample' return type */
export interface IUpdateExampleResult {
  created_at: Date;
  description: string | null;
  example_id: string;
  name: string;
}

/** 'UpdateExample' query type */
export interface IUpdateExampleQuery {
  params: IUpdateExampleParams;
  result: IUpdateExampleResult;
}

const updateExampleIR: any = {"usedParamSet":{"name":true,"description":true,"exampleId":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":45,"b":49}]},{"name":"description","required":false,"transform":{"type":"scalar"},"locs":[{"a":66,"b":77}]},{"name":"exampleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":98,"b":108}]}],"statement":"-- Update example\nUPDATE examples\nSET name = :name, description = :description\nWHERE example_id = :exampleId!\nRETURNING example_id, name, description, created_at"};

/**
 * Query generated from SQL:
 * ```
 * -- Update example
 * UPDATE examples
 * SET name = :name, description = :description
 * WHERE example_id = :exampleId!
 * RETURNING example_id, name, description, created_at
 * ```
 */
export const updateExample = new PreparedQuery<IUpdateExampleParams,IUpdateExampleResult>(updateExampleIR);


