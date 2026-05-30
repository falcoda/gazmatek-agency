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

  it("logs scheduler started when FEATURE_JOBS is on (no jobs registered yet)", () => {
    config.featureFlags.jobs = true;

    startScheduler();

    expect(mockSchedule).not.toHaveBeenCalled();
    expect(mLoggerInfo).toHaveBeenCalledWith("Job scheduler started", {
      jobs: 0,
    });
  });
});

describe("stopScheduler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("is a no-op when no jobs were scheduled", async () => {
    await expect(stopScheduler()).resolves.toBeUndefined();
    expect(mLoggerInfo).toHaveBeenCalledWith("Job scheduler stopped");
  });
});
