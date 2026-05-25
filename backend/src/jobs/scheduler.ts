import { config } from "@src/helpers/config";
import { logger } from "@src/helpers/logger";
import { runExampleJob } from "@src/jobs/example/exampleJob";
import { JOB_NAMES, JOB_SCHEDULES } from "@src/jobs/jobConstants";
import cron, { type ScheduledTask } from "node-cron";

let scheduledTasks: ScheduledTask[] = [];

/**
 * Runs a job in isolation: logs start, end, duration and result, and swallows
 * any error so a failing job can never crash the API process.
 */
const runJob = async (
  name: string,
  job: () => Promise<object>,
): Promise<void> => {
  const startedAt = Date.now();
  logger.info("Job started", { job: name });

  try {
    const result = await job();
    logger.info("Job completed", {
      job: name,
      duration_ms: Date.now() - startedAt,
      ...result,
    });
  } catch (error) {
    logger.error("Job failed", {
      job: name,
      duration_ms: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Starts the background job scheduler. Disabled entirely unless FEATURE_JOBS is
 * on; integrated into the API lifecycle (see apps/api.ts).
 *
 * Register real jobs here following the `runExampleJob` pattern: add the name
 * and cron expression to `jobConstants.ts`, then push a `cron.schedule(...)`.
 */
export const startScheduler = (): void => {
  if (!config.featureFlags.jobs) {
    logger.info("Job scheduler disabled", { feature_jobs: false });
    return;
  }

  scheduledTasks.push(
    cron.schedule(
      JOB_SCHEDULES.EXAMPLE,
      () => {
        void runJob(JOB_NAMES.EXAMPLE, runExampleJob);
      },
      { name: JOB_NAMES.EXAMPLE, noOverlap: true },
    ),
  );

  logger.info("Job scheduler started", { jobs: scheduledTasks.length });
};

/** Stops every scheduled job — registered as a graceful-shutdown task. */
export const stopScheduler = async (): Promise<void> => {
  for (const task of scheduledTasks) {
    await task.destroy();
  }
  scheduledTasks = [];
  logger.info("Job scheduler stopped");
};
