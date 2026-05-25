/**
 * Metrics Helper Tests
 *
 * Verifies that Prometheus metrics are correctly configured
 * and that counters/histograms are properly registered.
 */

import { Counter, Histogram, register } from "prom-client";

describe("Metrics Helper", () => {
  it("should have a metrics register", () => {
    expect(register).toBeDefined();
  });

  it("should support Counter metrics", () => {
    const counter = new Counter({
      name: "test_counter",
      help: "Test counter",
      registers: [register],
    });

    expect(counter).toBeDefined();
    expect(typeof counter.inc).toBe("function");
  });

  it("should support Histogram metrics", () => {
    const histogram = new Histogram({
      name: "test_histogram",
      help: "Test histogram",
      registers: [register],
    });

    expect(histogram).toBeDefined();
    expect(typeof histogram.observe).toBe("function");
  });

  it("should allow incrementing counter", () => {
    const counter = new Counter({
      name: "test_counter_inc",
      help: "Test counter increment",
      registers: [register],
    });

    expect(() => {
      counter.inc();
      counter.inc(5);
    }).not.toThrow();
  });

  it("should allow observing histogram values", () => {
    const histogram = new Histogram({
      name: "test_histogram_observe",
      help: "Test histogram observe",
      registers: [register],
    });

    expect(() => {
      histogram.observe(100);
      histogram.observe(250);
      histogram.observe(50);
    }).not.toThrow();
  });

  it("should be able to export metrics in Prometheus format", async () => {
    const metricsOutput = await register.metrics();
    expect(typeof metricsOutput).toBe("string");
    expect(metricsOutput.length).toBeGreaterThan(0);
    // Prometheus format includes HELP, TYPE, and metric lines
    expect(metricsOutput).toMatch(/# HELP/);
    expect(metricsOutput).toMatch(/# TYPE/);
  });
});
