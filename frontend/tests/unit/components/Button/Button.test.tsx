import { render, screen, userEvent } from "@tests/testUtils";
import type { ReactElement } from "react";
// `Button` renders its `to` variant with `Link` from `react-router`, so the
// link tests must be wrapped with the matching router from the same package.
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import Button from "@/components/Button/Button";

const renderInRouter = (ui: ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("Button", () => {
  it("renders the label inside a button element", () => {
    render(<Button label="Click me" />);

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
  });

  it("applies the default 'blue' style class", () => {
    render(<Button label="Primary" />);

    const button = screen.getByRole("button", { name: "Primary" });
    expect(button).toHaveClass("styledButton");
    expect(button).toHaveClass("blue");
  });

  it("applies a custom style variant and extra className", () => {
    render(<Button label="Danger" style="danger" className="extra" />);

    const button = screen.getByRole("button", { name: "Danger" });
    expect(button).toHaveClass("danger");
    expect(button).toHaveClass("extra");
  });

  it("fires the onClick handler when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button label="Tap" onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "Tap" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when loading and shows the loader", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <Button label="Loading" isLoading onClick={onClick} />,
    );

    await user.click(screen.getByRole("button"));

    expect(onClick).not.toHaveBeenCalled();
    expect(container.querySelector(".loaderButton")).not.toBeNull();
    expect(screen.queryByText("Loading")).not.toBeInTheDocument();
  });

  it("respects the disabled prop", () => {
    render(<Button label="Disabled" disabled />);

    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
  });

  it("forwards the type attribute", () => {
    render(<Button label="Submit" type="submit" />);

    expect(screen.getByRole("button", { name: "Submit" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("renders children alongside the label", () => {
    render(
      <Button label="With child">
        <span>extra content</span>
      </Button>,
    );

    expect(screen.getByText("extra content")).toBeInTheDocument();
  });

  it("renders as a router link when 'to' is provided", () => {
    renderInRouter(<Button label="Go home" to="/home" />);

    const link = screen.getByRole("link", { name: "Go home" });
    expect(link).toHaveAttribute("href", "/home");
    expect(link).toHaveClass("styledButton");
  });

  it("calls onClick when the link variant is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderInRouter(
      <Button label="Link click" to="/somewhere" onClick={onClick} />,
    );

    await user.click(screen.getByRole("link", { name: "Link click" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("opens an external link in a new tab when href is provided", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(
      <Button label="External" href="https://example.com" onClick={onClick} />,
    );

    await user.click(screen.getByRole("button", { name: "External" }));

    expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank");
    expect(onClick).not.toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it("exposes the aria-label and title attributes", () => {
    render(
      <Button label="Icon button" ariaLabel="Save" title="Save the file" />,
    );

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("title", "Save the file");
  });
});
