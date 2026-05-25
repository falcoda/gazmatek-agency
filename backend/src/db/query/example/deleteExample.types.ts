/** Types generated for queries found in "src/db/query/example/deleteExample.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'DeleteExample' parameters type */
export interface IDeleteExampleParams {
  exampleId: NumberOrString;
}

/** 'DeleteExample' return type */
export interface IDeleteExampleResult {
  example_id: string;
}

/** 'DeleteExample' query type */
export interface IDeleteExampleQuery {
  params: IDeleteExampleParams;
  result: IDeleteExampleResult;
}

const deleteExampleIR: any = {"usedParamSet":{"exampleId":true},"params":[{"name":"exampleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":87,"b":97}]}],"statement":"-- Soft delete example by ID\nUPDATE examples\nSET deleted_at = NOW()\nWHERE example_id = :exampleId!\nAND deleted_at IS NULL\nRETURNING example_id"};

/**
 * Query generated from SQL:
 * ```
 * -- Soft delete example by ID
 * UPDATE examples
 * SET deleted_at = NOW()
 * WHERE example_id = :exampleId!
 * AND deleted_at IS NULL
 * RETURNING example_id
 * ```
 */
export const deleteExample = new PreparedQuery<IDeleteExampleParams,IDeleteExampleResult>(deleteExampleIR);


