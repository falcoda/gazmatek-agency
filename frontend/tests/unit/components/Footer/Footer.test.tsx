import { renderWithProviders, screen } from "@tests/testUtils";
import { describe, expect, it } from "vitest";

import Footer from "@/components/Footer/Footer";

describe("Footer", () => {
  it("renders the footer section content", () => {
    renderWithProviders(<Footer />);

    expect(screen.getByText("This is footer")).toBeInTheDocument();
  });

  it("renders inside a section with the 'footer' class", () => {
    const { container } = renderWithProviders(<Footer />);

    const section = container.querySelector("section.footer");
    expect(section).not.toBeNull();
    expect(section).toHaveClass("section");
  });
});
