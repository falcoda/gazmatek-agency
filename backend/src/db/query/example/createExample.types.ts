/** Types generated for queries found in "src/db/query/example/createExample.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateExample' parameters type */
export interface ICreateExampleParams {
  description?: string | null | void;
  name: string;
}

/** 'CreateExample' return type */
export interface ICreateExampleResult {
  created_at: Date;
  description: string | null;
  example_id: string;
  name: string;
}

/** 'CreateExample' query type */
export interface ICreateExampleQuery {
  params: ICreateExampleParams;
  result: ICreateExampleResult;
}

const createExampleIR: any = {"usedParamSet":{"name":true,"description":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":69,"b":74}]},{"name":"description","required":false,"transform":{"type":"scalar"},"locs":[{"a":77,"b":88}]}],"statement":"-- Create new example\nINSERT INTO examples(name, description)\nVALUES(:name!, :description)\nRETURNING example_id, name, description, created_at"};

/**
 * Query generated from SQL:
 * ```
 * -- Create new example
 * INSERT INTO examples(name, description)
 * VALUES(:name!, :description)
 * RETURNING example_id, name, description, created_at
 * ```
 */
export const createExample = new PreparedQuery<ICreateExampleParams,ICreateExampleResult>(createExampleIR);


