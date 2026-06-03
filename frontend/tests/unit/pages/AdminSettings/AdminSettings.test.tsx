import { renderWithProviders, screen } from "@tests/testUtils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminSettings from "@/pages/AdminSettings/AdminSettings";

vi.mock("@/Utils/Services/Authenticated/adminAreaApi", () => ({
  fetchAdminAgencySignature: vi.fn(async () => ({
    signature_image_data_url: null,
    has_signature: false,
  })),
  uploadAdminAgencySignature: vi.fn(async () => ({
    signature_image_data_url: "data:image/png;base64,FAKE",
    has_signature: true,
  })),
  deleteAdminAgencySignature: vi.fn(async () => ({
    signature_image_data_url: null,
    has_signature: false,
  })),
  fetchAdminAgencyInfo: vi.fn(async () => ({
    name: "Gazmatek Universe Booking",
    representative: "Thomas Gozes",
    address: null,
    companyNumber: null,
    vatNumber: null,
    email: null,
    iban: null,
  })),
  putAdminAgencyInfo: vi.fn(async (info) => info),
}));

vi.mock("@/stores/AdminAuthStore", () => {
  const admin = { id: "a1", email: "admin@example.com", fullName: "Admin" };
  return {
    useAdminAuthStore: Object.assign(
      (selector?: (state: { admin: typeof admin }) => unknown) => {
        const state = { admin };
        return selector ? selector(state) : state;
      },
      {
        getState: () => ({ admin }),
      },
    ),
  };
});

describe("AdminSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the settings heading and the signature section", () => {
    renderWithProviders(<AdminSettings />);

    expect(
      screen.getByRole("heading", { name: "Agency settings" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Manager signature" }),
    ).toBeInTheDocument();
  });

  it("shows the empty state when no signature is saved", async () => {
    renderWithProviders(<AdminSettings />);

    expect(
      await screen.findByText(
        /No signature saved yet — contracts will be sent without an agency signature\./,
      ),
    ).toBeInTheDocument();
  });
});
