import { renderWithProviders } from "@tests/testUtils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CustomCursor from "@/components/CustomCursor/CustomCursor";

describe("CustomCursor", () => {
  beforeEach(() => {
    // jsdom may expose `ontouchstart`; ensure a deterministic non-touch baseline.
    delete (window as { ontouchstart?: unknown }).ontouchstart;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as { ontouchstart?: unknown }).ontouchstart;
  });

  it("renders the dot and ring elements on non-touch devices", () => {
    const { container } = renderWithProviders(<CustomCursor />);

    expect(container.querySelector(".customCursorDot")).not.toBeNull();
    expect(container.querySelector(".customCursorRing")).not.toBeNull();
  });

  it("updates the dot position when the mouse moves", () => {
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 1),
    );
    const { container } = renderWithProviders(<CustomCursor />);

    document.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 120, clientY: 80 }),
    );

    const dot = container.querySelector<HTMLDivElement>(".customCursorDot");
    expect(dot?.style.left).toBe("120px");
    expect(dot?.style.top).toBe("80px");
    vi.unstubAllGlobals();
  });

  it("renders nothing on touch devices", () => {
    Object.defineProperty(window, "ontouchstart", {
      configurable: true,
      value: null,
    });

    const { container } = renderWithProviders(<CustomCursor />);

    expect(container.querySelector(".customCursorDot")).toBeNull();
    expect(container.querySelector(".customCursorRing")).toBeNull();

    delete (window as { ontouchstart?: unknown }).ontouchstart;
  });

  it("removes the mousemove listener on unmount", () => {
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 1),
    );
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderWithProviders(<CustomCursor />);

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
    vi.unstubAllGlobals();
  });
});
