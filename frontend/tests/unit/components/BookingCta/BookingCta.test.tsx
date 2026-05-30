import { renderWithProviders, screen } from "@tests/testUtils";
import { describe, expect, it } from "vitest";

import BookingCta from "@/components/BookingCta/BookingCta";

describe("BookingCta", () => {
  it("renders the primary CTA with an aria-label", () => {
    renderWithProviders(<BookingCta variant="primary" />);

    const link = screen.getByRole("link", {
      name: /start a booking request/i,
    });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toContain("/booking/new");
  });

  it("includes the artistId in the URL when provided", () => {
    renderWithProviders(<BookingCta variant="primary" artistId="abc-123" />);

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toContain("artistId=abc-123");
  });

  it("uses the artist-specific label when artistName is provided", () => {
    renderWithProviders(
      <BookingCta variant="primary" artistId="abc" artistName="DJ Nova" />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveTextContent(/Book\s+DJ Nova/i);
  });
});
