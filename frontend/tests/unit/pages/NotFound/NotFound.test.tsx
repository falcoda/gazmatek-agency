import { renderWithProviders, screen } from "@tests/testUtils";
import { describe, expect, it } from "vitest";

import NotFound from "@/pages/NotFound/NotFound";

describe("NotFound", () => {
  it("renders the 404 code", () => {
    const { container } = renderWithProviders(<NotFound />);

    expect(container.querySelector(".notFound")).not.toBeNull();
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders the translated title and message", () => {
    renderWithProviders(<NotFound />);

    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "The page you are looking for does not exist or has been moved.",
      ),
    ).toBeInTheDocument();
  });

  it("renders a back-home link pointing at the main page", () => {
    renderWithProviders(<NotFound />);

    const link = screen.getByRole("link", { name: "Back to home" });
    expect(link).toBeInTheDocument();
    // Resolves to the localized main page (`/en/`) when I18N_ROUTING is on,
    // and to `/` otherwise — both map to PAGES.main.
    expect(link.getAttribute("href")).toMatch(/^(\/|\/[a-z]{2}\/)$/);
  });
});
