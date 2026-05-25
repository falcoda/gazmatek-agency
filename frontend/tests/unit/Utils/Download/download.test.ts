import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { downloadBlob, slugify } from "@/Utils/Download/download";

describe("slugify", () => {
  it("lowercases the value", () => {
    expect(slugify("Hello WORLD")).toBe("hello-world");
  });

  it("strips accents", () => {
    expect(slugify("Évènement à crÉer")).toBe("evenement-a-creer");
  });

  it("collapses non-alphanumeric runs into a single dash", () => {
    expect(slugify("a___b   c!!d")).toBe("a-b-c-d");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("  __edge__  ")).toBe("edge");
  });

  it("keeps digits", () => {
    expect(slugify("Report 2026 v2")).toBe("report-2026-v2");
  });
});

describe("downloadBlob", () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:fake-url");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an object URL, clicks an anchor, and revokes the URL", () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    const blob = new Blob(["payload"], { type: "text/plain" });
    downloadBlob(blob, "report.txt");

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
  });
});
