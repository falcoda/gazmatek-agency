describe("lifecycle helpers", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("executes shutdown tasks in reverse registration order", async () => {
    const { registerShutdownTask, runShutdown } =
      await import("@src/helpers/lifecycle");
    const order: string[] = [];

    registerShutdownTask("first", async () => {
      order.push("first");
    });
    registerShutdownTask("second", async () => {
      order.push("second");
    });

    await runShutdown("SIGTERM");

    expect(order).toEqual(["second", "first"]);
  });

  it("does not run tasks a second time after the first shutdown", async () => {
    const { registerShutdownTask, runShutdown } =
      await import("@src/helpers/lifecycle");
    let count = 0;

    registerShutdownTask("task", async () => {
      count++;
    });

    await runShutdown("SIGTERM");
    await runShutdown("SIGTERM");

    expect(count).toBe(1);
  });

  it("continues shutdown despite a failing task", async () => {
    const { registerShutdownTask, runShutdown } =
      await import("@src/helpers/lifecycle");
    const order: string[] = [];

    registerShutdownTask("bad", async () => {
      throw new Error("boom");
    });
    registerShutdownTask("ok", async () => {
      order.push("ok");
    });

    await expect(runShutdown("SIGTERM")).resolves.not.toThrow();
    expect(order).toContain("ok");
  });

  it("registerProcessSignalHandlers only registers handlers once", async () => {
    const onceSpy = jest.spyOn(process, "once").mockImplementation(function (
      this: unknown,
    ) {
      return process;
    } as typeof process.once);

    const { registerProcessSignalHandlers } =
      await import("@src/helpers/lifecycle");

    registerProcessSignalHandlers();
    registerProcessSignalHandlers();

    const events = onceSpy.mock.calls.map((c) => c[0]);
    expect(events.filter((e) => e === "SIGINT").length).toBe(1);
    expect(events.filter((e) => e === "SIGTERM").length).toBe(1);

    onceSpy.mockRestore();
  });

  it("resetLifecycleState clears the shutdown state", async () => {
    const { registerShutdownTask, resetLifecycleState, runShutdown } =
      await import("@src/helpers/lifecycle");
    let count = 0;

    registerShutdownTask("task", async () => {
      count++;
    });

    await runShutdown("SIGTERM");
    resetLifecycleState();
    registerShutdownTask("task", async () => {
      count++;
    });
    await runShutdown("SIGTERM");

    expect(count).toBe(2);
  });
});
