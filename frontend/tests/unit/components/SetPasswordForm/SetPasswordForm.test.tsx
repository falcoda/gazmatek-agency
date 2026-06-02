import { renderWithProviders, screen } from "@tests/testUtils";
import { describe, expect, it } from "vitest";

import SetPasswordForm from "@/components/SetPasswordForm/SetPasswordForm";

describe("SetPasswordForm", () => {
  it("renders the title and submit label for the given namespace", () => {
    renderWithProviders(
      <SetPasswordForm
        i18nNamespace="account.claim"
        seoPath="/account/claim"
      />,
      { initialEntries: ["/account/claim?token=abc"] },
    );

    // The i18n keys for the claim namespace resolve to real translations, so a
    // heading and a submit button must be present.
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders two password inputs", () => {
    const { container } = renderWithProviders(
      <SetPasswordForm
        i18nNamespace="account.reset"
        seoPath="/account/reset-password"
      />,
      { initialEntries: ["/account/reset-password?token=xyz"] },
    );

    expect(container.querySelectorAll("input")).toHaveLength(2);
  });
});
