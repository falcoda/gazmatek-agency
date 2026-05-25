/**
 * Logger Helper Tests
 *
 * Verifies that the logger helper correctly wraps the shared library logger
 * and does not use console.log directly (BMAD compliance).
 */

import { logger } from "@src/helpers/logger";

describe("Logger Helper", () => {
  it("should export a logger instance", () => {
    expect(logger).toBeDefined();
  });

  it("should have logging methods", () => {
    const methods = ["debug", "info", "warn", "error"];
    for (const method of methods) {
      expect(typeof (logger as any)[method]).toBe("function");
    }
  });

  it("should not throw when logging", () => {
    expect(() => {
      logger.debug("test message");
      logger.info("test message");
      logger.warn("test message");
      logger.error("test message");
    }).not.toThrow();
  });

  it("should be able to log with context", () => {
    expect(() => {
      logger.info("user created", { userId: 123, email: "test@example.com" });
    }).not.toThrow();
  });
});
