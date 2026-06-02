import { renderWithProviders, screen, userEvent } from "@tests/testUtils";
import { describe, expect, it } from "vitest";

import type { FaqItem } from "@/components/FaqAccordion/FaqAccordion";
import FaqAccordion from "@/components/FaqAccordion/FaqAccordion";

const items: FaqItem[] = [
  { q: "What is this?", a: "A reusable accordion." },
  { q: "How do I use it?", a: "Pass items as props." },
  { q: "Is it accessible?", a: "Yes, buttons expose aria-expanded." },
];

describe("FaqAccordion", () => {
  it("renders one question per item", () => {
    const { container } = renderWithProviders(<FaqAccordion items={items} />);

    expect(container.querySelectorAll(".faqItem")).toHaveLength(3);
    expect(screen.getByText("What is this?")).toBeInTheDocument();
    expect(screen.getByText("How do I use it?")).toBeInTheDocument();
  });

  it("opens the first item by default", () => {
    const { container } = renderWithProviders(<FaqAccordion items={items} />);

    const faqItems = container.querySelectorAll(".faqItem");
    expect(faqItems[0]).toHaveClass("isOpen");
    expect(faqItems[1]).not.toHaveClass("isOpen");
  });

  it("starts fully collapsed when defaultOpenIndex is null", () => {
    const { container } = renderWithProviders(
      <FaqAccordion items={items} defaultOpenIndex={null} />,
    );

    expect(container.querySelector(".isOpen")).toBeNull();
  });

  it("expands a collapsed item when its question is clicked", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<FaqAccordion items={items} />);

    await user.click(screen.getByRole("button", { name: "How do I use it?" }));

    const faqItems = container.querySelectorAll(".faqItem");
    expect(faqItems[1]).toHaveClass("isOpen");
    expect(faqItems[0]).not.toHaveClass("isOpen");
  });

  it("collapses the open item when its question is clicked again", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<FaqAccordion items={items} />);

    await user.click(screen.getByRole("button", { name: "What is this?" }));

    expect(container.querySelector(".isOpen")).toBeNull();
  });

  it("links each button to its panel and hides collapsed panels from a11y", () => {
    const { container } = renderWithProviders(<FaqAccordion items={items} />);

    const firstButton = screen.getByRole("button", { name: "What is this?" });
    const panelId = firstButton.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();

    const panel = container.querySelector(`#${panelId}`);
    expect(panel).toHaveAttribute("role", "region");
    // The open panel is exposed; collapsed ones are inert / aria-hidden.
    expect(panel).toHaveAttribute("aria-hidden", "false");

    const collapsedButton = screen.getByRole("button", {
      name: "How do I use it?",
    });
    const collapsedPanel = container.querySelector(
      `#${collapsedButton.getAttribute("aria-controls")}`,
    );
    expect(collapsedPanel).toHaveAttribute("aria-hidden", "true");
  });

  it("reflects the open state through aria-expanded", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FaqAccordion items={items} />);

    const first = screen.getByRole("button", { name: "What is this?" });
    const second = screen.getByRole("button", { name: "How do I use it?" });
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "false");

    await user.click(second);
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(first).toHaveAttribute("aria-expanded", "false");
  });
});
