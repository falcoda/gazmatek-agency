import { render, screen, userEvent } from "@tests/testUtils";
import { describe, expect, it, vi } from "vitest";

import Title from "@/components/Title/Title";

describe("Title", () => {
  it("renders its children", () => {
    render(<Title>Page heading</Title>);

    expect(screen.getByText("Page heading")).toBeInTheDocument();
  });

  it("renders an <h2> element by default", () => {
    const { container } = render(<Title>Default level</Title>);

    const heading = container.querySelector(".title");
    expect(heading).not.toBeNull();
    expect(heading?.tagName).toBe("H2");
  });

  it("renders the requested heading level", () => {
    const { container } = render(<Title level="h1">Top heading</Title>);

    expect(container.querySelector(".title")?.tagName).toBe("H1");
  });

  it("appends a custom className when provided", () => {
    const { container } = render(
      <Title className="accent">Styled heading</Title>,
    );

    expect(
      container.querySelector(".title")?.classList.contains("accent"),
    ).toBe(true);
  });

  it("calls onClick when the title is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Title onClick={onClick}>Clickable</Title>);

    await user.click(screen.getByText("Clickable"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
