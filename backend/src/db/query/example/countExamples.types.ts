/** Types generated for queries found in "src/db/query/example/countExamples.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CountExamples' parameters type */
export type ICountExamplesParams = void;

/** 'CountExamples' return type */
export interface ICountExamplesResult {
  total: number | null;
}

/** 'CountExamples' query type */
export interface ICountExamplesQuery {
  params: ICountExamplesParams;
  result: ICountExamplesResult;
}

const countExamplesIR: any = {"usedParamSet":{},"params":[],"statement":"-- Count all non-deleted examples\nSELECT COUNT(*)::int AS total\nFROM examples\nWHERE deleted_at IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * -- Count all non-deleted examples
 * SELECT COUNT(*)::int AS total
 * FROM examples
 * WHERE deleted_at IS NULL
 * ```
 */
export const countExamples = new PreparedQuery<ICountExamplesParams,ICountExamplesResult>(countExamplesIR);


