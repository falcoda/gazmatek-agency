import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PageShell from "@/components/PageShell/PageShell";

describe("PageShell", () => {
  it("renders its children inside the shell", () => {
    const { container, getByText } = render(
      <PageShell>
        <span>shell content</span>
      </PageShell>,
    );

    expect(container.querySelector(".pageShell")).not.toBeNull();
    expect(getByText("shell content")).toBeInTheDocument();
  });

  it("applies the custom className when provided", () => {
    const { container } = render(
      <PageShell className="customLayout">
        <span>content</span>
      </PageShell>,
    );

    const shell = container.querySelector(".pageShell");
    expect(shell?.classList.contains("customLayout")).toBe(true);
  });

  it("does not append a trailing space when no className is provided", () => {
    const { container } = render(
      <PageShell>
        <span>content</span>
      </PageShell>,
    );

    expect(container.querySelector(".pageShell")?.className).toBe("pageShell");
  });

  it("restores document overflow styles on unmount", () => {
    const { unmount } = render(
      <PageShell>
        <span>content</span>
      </PageShell>,
    );

    expect(document.body.style.overflow).toBe("auto");
    expect(document.documentElement.style.overflow).toBe("auto");

    unmount();

    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
  });
});
