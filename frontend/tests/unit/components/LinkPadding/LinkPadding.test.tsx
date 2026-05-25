import { render, screen } from "@tests/testUtils";
import { describe, expect, it } from "vitest";

import LinkPadding from "@/components/LinkPadding/LinkPadding";

describe("LinkPadding", () => {
  it("renders its children", () => {
    render(
      <LinkPadding>
        <span>wrapped content</span>
      </LinkPadding>,
    );

    expect(screen.getByText("wrapped content")).toBeInTheDocument();
  });

  it("renders a wrapper with the linkPadding class", () => {
    const { container } = render(<LinkPadding>content</LinkPadding>);

    expect(container.querySelector(".linkPadding")).not.toBeNull();
  });

  it("appends a custom className when provided", () => {
    const { container } = render(
      <LinkPadding className="custom">content</LinkPadding>,
    );

    const wrapper = container.querySelector(".linkPadding");
    expect(wrapper?.classList.contains("custom")).toBe(true);
  });

  it("does not add an extra class when className is omitted", () => {
    const { container } = render(<LinkPadding>content</LinkPadding>);

    const wrapper = container.querySelector(".linkPadding");
    expect(wrapper?.className.trim()).toBe("linkPadding");
  });
});
