import { logger } from "@src/helpers/logger";

type ShutdownTask = {
  name: string;
  task: () => Promise<void>;
};

const shutdownTasks: ShutdownTask[] = [];
let handlersRegistered = false;
let shuttingDown = false;
let sigintHandler: (() => void) | null = null;
let sigtermHandler: (() => void) | null = null;

export const registerShutdownTask = (
  name: string,
  task: () => Promise<void>,
) => {
  shutdownTasks.push({ name, task });
};

export const runShutdown = async (signal: string) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info("Shutdown started", { signal });

  const tasks = [...shutdownTasks].reverse();

  for (const entry of tasks) {
    try {
      await entry.task();
      logger.info("Shutdown task completed", { task: entry.name });
    } catch (error) {
      const err = error as Error;
      logger.error("Shutdown task failed", {
        task: entry.name,
        error: err.message,
      });
    }
  }
};

export const resetLifecycleState = (): void => {
  if (sigintHandler) {
    process.removeListener("SIGINT", sigintHandler);
  }

  if (sigtermHandler) {
    process.removeListener("SIGTERM", sigtermHandler);
  }

  shutdownTasks.length = 0;
  handlersRegistered = false;
  shuttingDown = false;
  sigintHandler = null;
  sigtermHandler = null;
};

export const registerProcessSignalHandlers = () => {
  if (handlersRegistered) {
    return;
  }

  handlersRegistered = true;

  const stop = async (signal: NodeJS.Signals) => {
    await runShutdown(signal);
    process.exit(0);
  };

  sigintHandler = () => {
    void stop("SIGINT");
  };

  sigtermHandler = () => {
    void stop("SIGTERM");
  };

  process.once("SIGINT", sigintHandler);
  process.once("SIGTERM", sigtermHandler);
};
