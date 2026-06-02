import { render, screen } from "@tests/testUtils";
import { describe, expect, it } from "vitest";

import Surface from "@/components/Surface/Surface";

describe("Surface", () => {
  it("renders its children", () => {
    render(
      <Surface>
        <p>surface body</p>
      </Surface>,
    );

    expect(screen.getByText("surface body")).toBeInTheDocument();
  });

  it("defaults to a <div> with the surface class", () => {
    const { container } = render(<Surface>content</Surface>);

    expect(container.querySelector("div.surface")).not.toBeNull();
  });

  it("renders a custom element when `as` is provided", () => {
    const { container } = render(<Surface as="li">content</Surface>);

    expect(container.querySelector("li.surface")).not.toBeNull();
    expect(container.querySelector("div.surface")).toBeNull();
  });

  it("appends a custom className", () => {
    const { container } = render(<Surface className="step">content</Surface>);

    expect(
      container.querySelector(".surface")?.classList.contains("step"),
    ).toBe(true);
  });
});
