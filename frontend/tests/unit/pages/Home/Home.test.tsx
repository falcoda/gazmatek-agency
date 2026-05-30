import { renderWithProviders, screen, waitFor } from "@tests/testUtils";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/Utils/Services/Public/artistsApi", () => ({
  fetchArtists: vi.fn(),
}));

vi.mock("@/Utils/Services/Public/statsApi", () => ({
  fetchHomeStats: vi.fn(),
}));

import Home from "@/pages/Home/Home";
import { fetchArtists } from "@/Utils/Services/Public/artistsApi";
import { fetchHomeStats } from "@/Utils/Services/Public/statsApi";

const mockedFetch = vi.mocked(fetchArtists);
const mockedFetchStats = vi.mocked(fetchHomeStats);

describe("Home page", () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    mockedFetchStats.mockReset();
    mockedFetchStats.mockResolvedValue({
      publishedArtists: 0,
      producedEvents: 0,
    });
  });

  it("renders the hero title and the booking CTA above the fold", async () => {
    mockedFetch.mockResolvedValue({
      data: [],
      pagination: { page: 1, pageSize: 8, total: 0, totalPages: 0 },
    });

    renderWithProviders(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: /Gazmatek/i }),
    ).toBeInTheDocument();

    const cta = screen.getAllByRole("link", {
      name: /start a booking request/i,
    });
    expect(cta.length).toBeGreaterThanOrEqual(1);

    await waitFor(() => expect(mockedFetch).toHaveBeenCalled());
  });

  it("falls back to a discovery link when no featured artists exist", async () => {
    mockedFetch.mockResolvedValue({
      data: [],
      pagination: { page: 1, pageSize: 8, total: 0, totalPages: 0 },
    });

    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/Discover our artists/i)).toBeInTheDocument();
    });
  });

  it("renders artist cards when featured artists are returned", async () => {
    mockedFetch.mockResolvedValue({
      data: [
        {
          id: "1",
          slug: "dj-nova",
          stageName: "DJ Nova",
          bio: "Bio",
          genre: "dj",
          isFeatured: true,
          coverImageUrl: null,
          level: "L2",
          supportedSetTypes: ["dj"],
        },
      ],
      pagination: { page: 1, pageSize: 8, total: 1, totalPages: 1 },
    });

    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 3, name: /DJ Nova/i }),
      ).toBeInTheDocument();
    });
  });
});
