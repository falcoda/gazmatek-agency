import { runExampleJob } from "@src/jobs/example/exampleJob";

describe("runExampleJob", () => {
  it("resolves to an object carrying a ranAt ISO timestamp", async () => {
    const result = (await runExampleJob()) as { ranAt: string };

    expect(typeof result.ranAt).toBe("string");
    expect(new Date(result.ranAt).toISOString()).toBe(result.ranAt);
  });
});
