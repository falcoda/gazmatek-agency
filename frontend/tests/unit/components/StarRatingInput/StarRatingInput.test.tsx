import { renderWithProviders, screen, userEvent } from "@tests/testUtils";
import { describe, expect, it, vi } from "vitest";

import StarRatingInput from "@/components/StarRatingInput/StarRatingInput";

describe("StarRatingInput", () => {
  it("renders five star buttons by default", () => {
    const { container } = renderWithProviders(
      <StarRatingInput setValue={vi.fn()} />,
    );

    expect(container.querySelectorAll(".starButton")).toHaveLength(5);
  });

  it("respects a custom max", () => {
    const { container } = renderWithProviders(
      <StarRatingInput setValue={vi.fn()} max={3} />,
    );

    expect(container.querySelectorAll(".starButton")).toHaveLength(3);
  });

  it("shows a dash when no value is selected", () => {
    renderWithProviders(<StarRatingInput setValue={vi.fn()} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows the value label for the current rating", () => {
    renderWithProviders(<StarRatingInput setValue={vi.fn()} value={3} />);

    expect(screen.getByText("3/5")).toBeInTheDocument();
  });

  it("marks the selected stars as active", () => {
    const { container } = renderWithProviders(
      <StarRatingInput setValue={vi.fn()} value={2} />,
    );

    const stars = container.querySelectorAll(".starButton");
    expect(stars[0]).toHaveClass("active");
    expect(stars[1]).toHaveClass("active");
    expect(stars[2]).not.toHaveClass("active");
  });

  it("calls setValue with the clicked star value", async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();
    renderWithProviders(<StarRatingInput setValue={setValue} />);

    await user.click(screen.getByRole("button", { name: "4/5" }));

    expect(setValue).toHaveBeenCalledWith(4);
  });

  it("clears the rating when the active star is clicked again", async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();
    renderWithProviders(<StarRatingInput setValue={setValue} value={3} />);

    await user.click(screen.getByRole("button", { name: "3/5" }));

    expect(setValue).toHaveBeenCalledWith(undefined);
  });

  it("renders an optional label", () => {
    renderWithProviders(
      <StarRatingInput setValue={vi.fn()} label="Your rating" />,
    );

    expect(screen.getByText("Your rating")).toBeInTheDocument();
  });

  it("renders a clear button and triggers it when a value is set", async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();
    renderWithProviders(
      <StarRatingInput setValue={setValue} value={2} clearLabel="Clear" />,
    );

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(setValue).toHaveBeenCalledWith(undefined);
  });

  it("hides the clear button when no value is set", () => {
    renderWithProviders(
      <StarRatingInput setValue={vi.fn()} clearLabel="Clear" />,
    );

    expect(
      screen.queryByRole("button", { name: "Clear" }),
    ).not.toBeInTheDocument();
  });
});
