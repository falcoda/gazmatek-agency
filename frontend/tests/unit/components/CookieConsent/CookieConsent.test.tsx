import { fireEvent, renderWithProviders, screen } from "@tests/testUtils";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CookieConsent from "@/components/CookieConsent/CookieConsent";
import { useCookieConsentStore } from "@/stores/CookieConsentStore";
import { COOKIE_CONSENT_STORAGE_KEY } from "@/Utils/Consent/cookieConsent";

/**
 * The Zustand store is a module-level singleton, so its state leaks across
 * tests. Reset it to the first-visit baseline (banner open, no decision)
 * before each test and clear the persisted record.
 */
function resetConsentState(): void {
  window.localStorage.clear();
  useCookieConsentStore.setState({ consent: null, isBannerOpen: true });
}

describe("CookieConsent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetConsentState();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    resetConsentState();
  });

  it("renders the banner dialog on first visit", () => {
    const { container } = renderWithProviders(<CookieConsent />);

    // Flush the deferred requestAnimationFrame entrance transition.
    act(() => vi.advanceTimersByTime(0));

    expect(container.querySelector(".cookieConsent")).not.toBeNull();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("We value your privacy")).toBeInTheDocument();
  });

  it("persists a full grant to localStorage when accepting all", () => {
    renderWithProviders(<CookieConsent />);

    fireEvent.click(screen.getByText("Accept all"));
    // Wait out the exit animation that commits the decision.
    act(() => vi.advanceTimersByTime(500));

    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const record = JSON.parse(raw ?? "{}");
    expect(record.preferences).toMatchObject({
      necessary: true,
      analytics: true,
      marketing: true,
    });
    expect(useCookieConsentStore.getState().isBannerOpen).toBe(false);
  });

  it("persists an essential-only decision when rejecting all", () => {
    renderWithProviders(<CookieConsent />);

    fireEvent.click(screen.getByText("Reject all"));
    act(() => vi.advanceTimersByTime(500));

    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    const record = JSON.parse(raw ?? "{}");
    expect(record.preferences).toMatchObject({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  });

  it("reveals the category toggles when customizing", () => {
    renderWithProviders(<CookieConsent />);
    act(() => vi.advanceTimersByTime(0));

    expect(screen.queryByText("Save my choices")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Customize"));

    expect(screen.getByText("Save my choices")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Marketing")).toBeInTheDocument();
  });

  it("shows the discreet reopen button once a decision is stored", () => {
    useCookieConsentStore.setState({
      consent: {
        id: "test-id",
        version: 1,
        decidedAt: new Date().toISOString(),
        preferences: { necessary: true, analytics: false, marketing: false },
      },
      isBannerOpen: false,
    });

    const { container } = renderWithProviders(<CookieConsent />);

    expect(container.querySelector(".cookieConsent")).toBeNull();
    const reopen = container.querySelector(".cookieReopen");
    expect(reopen).not.toBeNull();

    fireEvent.click(reopen as Element);
    expect(useCookieConsentStore.getState().isBannerOpen).toBe(true);
  });
});
