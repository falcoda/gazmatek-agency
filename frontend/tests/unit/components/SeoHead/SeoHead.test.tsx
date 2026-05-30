import { renderWithProviders, waitFor } from "@tests/testUtils";
import { describe, expect, it } from "vitest";

import SeoHead from "@/components/SeoHead/SeoHead";

const EXPECTED_TITLE = "Gazmatek — Artist booking agency";
const EXPECTED_DESCRIPTION =
  "Gazmatek represents DJs, live acts and performers. Discover our artists and book your next event.";

describe("SeoHead", () => {
  it("sets the document title from the translation", async () => {
    renderWithProviders(<SeoHead />);

    await waitFor(() => {
      expect(document.title).toBe(EXPECTED_TITLE);
    });
  });

  it("renders the meta description", async () => {
    renderWithProviders(<SeoHead />);

    await waitFor(() => {
      const description = document.head.querySelector(
        'meta[name="description"]',
      );
      expect(description?.getAttribute("content")).toBe(EXPECTED_DESCRIPTION);
    });
  });

  it("renders a canonical link for the resolved language", async () => {
    renderWithProviders(<SeoHead />);

    await waitFor(() => {
      const canonical = document.head.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute("href")).toBe(
        "https://booking.Gazmatek.com/en/",
      );
    });
  });

  it("renders Open Graph and Twitter meta tags", async () => {
    renderWithProviders(<SeoHead />);

    await waitFor(() => {
      expect(
        document.head
          .querySelector('meta[property="og:title"]')
          ?.getAttribute("content"),
      ).toBe(EXPECTED_TITLE);
      expect(
        document.head
          .querySelector('meta[property="og:locale"]')
          ?.getAttribute("content"),
      ).toBe("en_US");
      expect(
        document.head
          .querySelector('meta[name="twitter:title"]')
          ?.getAttribute("content"),
      ).toBe(EXPECTED_TITLE);
    });
  });

  it("renders the JSON-LD structured data scripts", async () => {
    renderWithProviders(<SeoHead />);

    await waitFor(() => {
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"]',
      );
      expect(scripts).toHaveLength(2);
    });

    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const types = Array.from(scripts).map(
      (script) =>
        (JSON.parse(script.textContent ?? "{}") as { "@type": string })[
          "@type"
        ],
    );

    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
  });
});
