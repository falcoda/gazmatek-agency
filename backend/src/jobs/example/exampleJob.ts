/**
 * Example background job.
 *
 * Demonstrates the contract expected by the scheduler: a function returning a
 * `Promise<object>` of summary fields, which `runJob` merges into its
 * "Job completed" log line. Replace this with real jobs (expired-token
 * cleanup, reminder emails, ...) and register them in `jobs/scheduler.ts`.
 *
 * Jobs that need database access should accept the `Pool` as an argument, the
 * same way services do.
 */
export const runExampleJob = (): Promise<object> =>
  Promise.resolve({ ranAt: new Date().toISOString() });
