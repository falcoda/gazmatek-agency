import { render, screen } from "@tests/testUtils";
import { describe, expect, it } from "vitest";

import Bounded from "@/components/Bounded/Bounded";

describe("Bounded", () => {
  it("renders its children", () => {
    render(
      <Bounded>
        <p>bounded body</p>
      </Bounded>,
    );

    expect(screen.getByText("bounded body")).toBeInTheDocument();
  });

  it("defaults to a <div> with the wide width variant", () => {
    const { container } = render(<Bounded>content</Bounded>);

    const el = container.querySelector("div.bounded");
    expect(el).not.toBeNull();
    expect(el?.classList.contains("bounded--wide")).toBe(true);
  });

  it("applies the requested width variant", () => {
    const { container } = render(<Bounded width="text">content</Bounded>);

    const el = container.querySelector("div.bounded");
    expect(el?.classList.contains("bounded--text")).toBe(true);
    expect(el?.classList.contains("bounded--wide")).toBe(false);
  });

  it("appends a custom className", () => {
    const { container } = render(<Bounded className="inner">content</Bounded>);

    expect(
      container.querySelector("div.bounded")?.classList.contains("inner"),
    ).toBe(true);
  });

  it("renders a custom element when `as` is provided", () => {
    const { container } = render(<Bounded as="header">content</Bounded>);

    expect(container.querySelector("header.bounded")).not.toBeNull();
  });
});
