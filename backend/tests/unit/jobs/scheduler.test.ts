const mockSchedule = jest.fn();

jest.mock("node-cron", () => ({
  __esModule: true,
  default: { schedule: mockSchedule },
  schedule: mockSchedule,
}));

jest.mock("@src/helpers/config", () => ({
  config: {
    featureFlags: { jobs: false },
  },
}));

jest.mock("@src/helpers/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

import { config } from "@src/helpers/config";
import { logger } from "@src/helpers/logger";
import { JOB_NAMES, JOB_SCHEDULES } from "@src/jobs/jobConstants";
import { startScheduler, stopScheduler } from "@src/jobs/scheduler";

const mLoggerInfo = logger.info as jest.Mock;

describe("startScheduler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    config.featureFlags.jobs = false;
  });

  afterEach(async () => {
    // Drop any task registered during a test so suites stay isolated.
    await stopScheduler();
  });

  it("registers nothing and logs disabled when FEATURE_JOBS is off", () => {
    config.featureFlags.jobs = false;

    startScheduler();

    expect(mockSchedule).not.toHaveBeenCalled();
    expect(mLoggerInfo).toHaveBeenCalledWith("Job scheduler disabled", {
      feature_jobs: false,
    });
  });

  it("registers the example job when FEATURE_JOBS is on", () => {
    config.featureFlags.jobs = true;
    mockSchedule.mockReturnValue({ destroy: jest.fn() });

    startScheduler();

    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith(
      JOB_SCHEDULES.EXAMPLE,
      expect.any(Function),
      { name: JOB_NAMES.EXAMPLE, noOverlap: true },
    );
    expect(mLoggerInfo).toHaveBeenCalledWith("Job scheduler started", {
      jobs: 1,
    });
  });
});

describe("stopScheduler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("destroys every scheduled task and logs stopped", async () => {
    const destroy = jest.fn().mockResolvedValue(undefined);
    config.featureFlags.jobs = true;
    mockSchedule.mockReturnValue({ destroy });

    startScheduler();
    await stopScheduler();

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(mLoggerInfo).toHaveBeenCalledWith("Job scheduler stopped");
  });

  it("is a no-op when no jobs were scheduled", async () => {
    await expect(stopScheduler()).resolves.toBeUndefined();
    expect(mLoggerInfo).toHaveBeenCalledWith("Job scheduler stopped");
  });
});
