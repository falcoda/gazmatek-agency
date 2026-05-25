import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useRevealOnScroll from "@/hooks/useRevealOnScroll";

/** Captured constructor argument so tests can drive the observer manually. */
type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;

/**
 * Replaces the global `IntersectionObserver` with a controllable fake. The
 * returned helpers expose the captured callback and the elements that were
 * observed/disconnected so each test can simulate intersection at will.
 */
function stubIntersectionObserver() {
  let capturedCallback: ObserverCallback | undefined;
  const observed: Element[] = [];
  const unobserved: Element[] = [];
  const disconnect = vi.fn();

  class FakeIntersectionObserver {
    constructor(callback: ObserverCallback) {
      capturedCallback = callback;
    }
    observe = (element: Element): void => {
      observed.push(element);
    };
    unobserve = (element: Element): void => {
      unobserved.push(element);
    };
    disconnect = disconnect;
    takeRecords = (): IntersectionObserverEntry[] => [];
    root = null;
    rootMargin = "";
    thresholds: ReadonlyArray<number> = [];
  }

  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);

  return {
    /** Simulates the observer reporting the given elements as intersecting. */
    triggerIntersection(elements: Element[]): void {
      const entries = elements.map(
        (target) =>
          ({ target, isIntersecting: true }) as IntersectionObserverEntry,
      );
      capturedCallback?.(entries);
    },
    observed,
    unobserved,
    disconnect,
  };
}

/** Overrides `matchMedia` so `prefers-reduced-motion` resolves to `matches`. */
function setReducedMotion(matches: boolean): void {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as MediaQueryList,
  );
}

describe("useRevealOnScroll", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("adds `reveal--visible` once an element intersects the viewport", () => {
    const reveal = document.createElement("div");
    reveal.classList.add("reveal");
    document.body.appendChild(reveal);

    const observer = stubIntersectionObserver();

    renderHook(() => useRevealOnScroll());

    expect(reveal.classList.contains("reveal--visible")).toBe(false);

    observer.triggerIntersection([reveal]);

    expect(reveal.classList.contains("reveal--visible")).toBe(true);
    expect(observer.unobserved).toContain(reveal);
  });

  it("observes every `.reveal` element on the page", () => {
    const first = document.createElement("div");
    const second = document.createElement("div");
    first.classList.add("reveal");
    second.classList.add("reveal");
    document.body.append(first, second);

    const observer = stubIntersectionObserver();

    renderHook(() => useRevealOnScroll());

    expect(observer.observed).toEqual([first, second]);
  });

  it("reveals all elements immediately when reduced motion is preferred", () => {
    const first = document.createElement("div");
    const second = document.createElement("div");
    first.classList.add("reveal");
    second.classList.add("reveal");
    document.body.append(first, second);

    setReducedMotion(true);
    const observer = stubIntersectionObserver();

    renderHook(() => useRevealOnScroll());

    expect(first.classList.contains("reveal--visible")).toBe(true);
    expect(second.classList.contains("reveal--visible")).toBe(true);
    // No observer is created when reduced motion shortcuts the effect.
    expect(observer.observed).toHaveLength(0);
  });

  it("does nothing when there are no `.reveal` elements", () => {
    const observer = stubIntersectionObserver();

    renderHook(() => useRevealOnScroll());

    expect(observer.observed).toHaveLength(0);
  });

  it("disconnects the observer on unmount", () => {
    const reveal = document.createElement("div");
    reveal.classList.add("reveal");
    document.body.appendChild(reveal);

    const observer = stubIntersectionObserver();

    const { unmount } = renderHook(() => useRevealOnScroll());
    unmount();

    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });
});
