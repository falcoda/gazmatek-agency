import { renderWithProviders, screen } from "@tests/testUtils";
import { describe, expect, it } from "vitest";

import RouteFallback from "@/components/RouteFallback/RouteFallback";

describe("RouteFallback", () => {
  it("renders the fallback container with a status role", () => {
    const { container } = renderWithProviders(<RouteFallback />);

    expect(container.querySelector(".routeFallback")).not.toBeNull();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders the spinner inside the fallback", () => {
    const { container } = renderWithProviders(<RouteFallback />);

    expect(container.querySelector(".spinner")).not.toBeNull();
  });
});
