import { render, screen } from "@tests/testUtils";
import { describe, expect, it } from "vitest";

import Section from "@/components/Section/Section";

describe("Section", () => {
  it("renders its children", () => {
    render(
      <Section>
        <p>section body</p>
      </Section>,
    );

    expect(screen.getByText("section body")).toBeInTheDocument();
  });

  it("renders a <section> element with the section class", () => {
    const { container } = render(<Section>content</Section>);

    const section = container.querySelector("section.section");
    expect(section).not.toBeNull();
    expect(section?.tagName).toBe("SECTION");
  });

  it("appends a custom className when provided", () => {
    const { container } = render(<Section className="hero">content</Section>);

    const section = container.querySelector("section.section");
    expect(section?.classList.contains("hero")).toBe(true);
  });

  it("does not add an extra class when className is omitted", () => {
    const { container } = render(<Section>content</Section>);

    expect(container.querySelector("section")?.className.trim()).toBe(
      "section",
    );
  });

  it("renders a custom element when `as` is provided", () => {
    const { container } = render(<Section as="div">content</Section>);

    expect(container.querySelector("div.section")).not.toBeNull();
    expect(container.querySelector("section")).toBeNull();
  });
});
