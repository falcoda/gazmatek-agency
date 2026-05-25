/**
 * Stable identifiers and schedules for background jobs.
 *
 * Job names and cron expressions are centralised here so they are never
 * scattered as string literals across the codebase (AGENTS.md, Rule 4).
 */

export const JOB_NAMES = {
  EXAMPLE: "example",
} as const;

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];

/**
 * Cron expressions (5-field, node-cron). Times are in the server timezone.
 */
export const JOB_SCHEDULES = {
  /** Every day at 03:15. */
  EXAMPLE: "15 3 * * *",
} as const;
