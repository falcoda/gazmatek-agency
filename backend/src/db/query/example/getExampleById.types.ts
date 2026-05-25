/** Types generated for queries found in "src/db/query/example/getExampleById.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'GetExampleById' parameters type */
export interface IGetExampleByIdParams {
  exampleId: NumberOrString;
}

/** 'GetExampleById' return type */
export interface IGetExampleByIdResult {
  created_at: Date;
  description: string | null;
  example_id: string;
  name: string;
}

/** 'GetExampleById' query type */
export interface IGetExampleByIdQuery {
  params: IGetExampleByIdParams;
  result: IGetExampleByIdResult;
}

const getExampleByIdIR: any = {"usedParamSet":{"exampleId":true},"params":[{"name":"exampleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":127,"b":137}]}],"statement":"-- Get example by ID (excludes soft-deleted)\nSELECT example_id, name, description, created_at\nFROM examples\nWHERE example_id = :exampleId!\nAND deleted_at IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * -- Get example by ID (excludes soft-deleted)
 * SELECT example_id, name, description, created_at
 * FROM examples
 * WHERE example_id = :exampleId!
 * AND deleted_at IS NULL
 * ```
 */
export const getExampleById = new PreparedQuery<IGetExampleByIdParams,IGetExampleByIdResult>(getExampleByIdIR);


