import { renderWithProviders, screen, userEvent } from "@tests/testUtils";
import { describe, expect, it, vi } from "vitest";

import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";

describe("LanguageSwitcher", () => {
  it("renders a button for every supported language", () => {
    renderWithProviders(<LanguageSwitcher />);

    expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "FR" })).toBeInTheDocument();
  });

  it("exposes the localized aria-label on the group", () => {
    renderWithProviders(<LanguageSwitcher />);

    expect(
      screen.getByRole("group", { name: "Switch language" }),
    ).toBeInTheDocument();
  });

  it("does not apply the mobile class by default", () => {
    const { container } = renderWithProviders(<LanguageSwitcher />);

    const switcher = container.querySelector(".languageSwitcher");
    expect(switcher).not.toBeNull();
    expect(switcher?.classList.contains("mobile")).toBe(false);
  });

  it("applies the mobile class when the mobile prop is set", () => {
    const { container } = renderWithProviders(<LanguageSwitcher mobile />);

    expect(
      container
        .querySelector(".languageSwitcher")
        ?.classList.contains("mobile"),
    ).toBe(true);
  });

  it("marks the current language button as active from the route param", () => {
    renderWithProviders(<LanguageSwitcher />, {
      initialEntries: ["/fr/"],
      routePath: "/:lang/*",
    });

    expect(
      screen.getByRole("button", { name: "FR" }).classList.contains("active"),
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "EN" }).classList.contains("active"),
    ).toBe(false);
  });

  it("falls back to the default language when no route param is present", () => {
    renderWithProviders(<LanguageSwitcher />);

    expect(
      screen.getByRole("button", { name: "EN" }).classList.contains("active"),
    ).toBe(true);
  });

  it("calls toggleNavbar after switching language in mobile mode", async () => {
    const user = userEvent.setup();
    const toggleNavbar = vi.fn();

    renderWithProviders(
      <LanguageSwitcher mobile toggleNavbar={toggleNavbar} />,
      { initialEntries: ["/en/"], routePath: "/:lang/*" },
    );

    await user.click(screen.getByRole("button", { name: "FR" }));

    expect(toggleNavbar).toHaveBeenCalledTimes(1);
  });

  it("does not call toggleNavbar when the current language is clicked", async () => {
    const user = userEvent.setup();
    const toggleNavbar = vi.fn();

    renderWithProviders(
      <LanguageSwitcher mobile toggleNavbar={toggleNavbar} />,
      { initialEntries: ["/en/"], routePath: "/:lang/*" },
    );

    await user.click(screen.getByRole("button", { name: "EN" }));

    expect(toggleNavbar).not.toHaveBeenCalled();
  });
});
