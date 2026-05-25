import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

import i18n from "@/i18n/i18n";

// Force a deterministic language so translation assertions are stable.
void i18n.changeLanguage("en");

// covaltech `Modal` (and other portalled components) render into `#root`.
beforeAll(() => {
  if (!document.getElementById("root")) {
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
  }
});

// React Testing Library unmounts each rendered tree between tests.
afterEach(() => {
  cleanup();
});

// --- jsdom polyfills ---------------------------------------------------------
// jsdom does not implement these browser APIs; components and animation hooks
// rely on them, so we provide inert stubs.

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

class ObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

vi.stubGlobal("IntersectionObserver", ObserverStub);
vi.stubGlobal("ResizeObserver", ObserverStub);

window.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();
