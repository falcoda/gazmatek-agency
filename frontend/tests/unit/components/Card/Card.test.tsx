import { renderWithProviders, screen } from "@tests/testUtils";
import { describe, expect, it } from "vitest";

import Card from "@/components/Card/Card";

describe("Card", () => {
  it("renders its children", () => {
    renderWithProviders(
      <Card>
        <p>card content</p>
      </Card>,
    );

    expect(screen.getByText("card content")).toBeInTheDocument();
  });

  it("applies the base 'card' class", () => {
    const { container } = renderWithProviders(<Card>body</Card>);

    expect(container.querySelector(".card")).not.toBeNull();
  });

  it("appends an extra className when provided", () => {
    const { container } = renderWithProviders(
      <Card className="highlight">body</Card>,
    );

    const card = container.querySelector(".card");
    expect(card).not.toBeNull();
    expect(card).toHaveClass("highlight");
  });

  it("renders without a trailing className when none is provided", () => {
    const { container } = renderWithProviders(<Card>body</Card>);

    const card = container.querySelector(".card");
    expect(card?.className.trim()).toBe("card");
  });
});
