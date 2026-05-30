import { renderWithProviders, screen, userEvent } from "@tests/testUtils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RejectBookingModal from "@/components/RejectBookingModal/RejectBookingModal";
import { rejectAdminBooking } from "@/Utils/Services/Authenticated/adminAreaApi";

vi.mock("@/Utils/Services/Authenticated/adminAreaApi", () => ({
  rejectAdminBooking: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockedReject = vi.mocked(rejectAdminBooking);

const renderModal = (
  overrides: Partial<Parameters<typeof RejectBookingModal>[0]> = {},
) =>
  renderWithProviders(
    <RejectBookingModal
      bookingId="booking-1"
      onRejected={vi.fn()}
      {...overrides}
    />,
  );

describe("RejectBookingModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the reject trigger button without opening the modal", () => {
    renderModal();

    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    expect(screen.queryByText("Reject booking")).not.toBeInTheDocument();
  });

  it("opens the modal with a reason field when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "Reject" }));

    expect(screen.getByText("Reject booking")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("allows rejecting without a reason (sends an empty string)", async () => {
    const user = userEvent.setup();
    mockedReject.mockResolvedValueOnce({} as never);
    renderModal();

    await user.click(screen.getByRole("button", { name: "Reject" }));
    await user.click(screen.getByRole("button", { name: "Confirm rejection" }));

    expect(mockedReject).toHaveBeenCalledWith("booking-1", "");
  });

  it("submits the reason and closes the modal on success", async () => {
    const user = userEvent.setup();
    const onRejected = vi.fn();
    mockedReject.mockResolvedValueOnce({} as never);
    renderModal({ onRejected });

    await user.click(screen.getByRole("button", { name: "Reject" }));
    await user.type(screen.getByRole("textbox"), "Date unavailable");
    await user.click(screen.getByRole("button", { name: "Confirm rejection" }));

    expect(mockedReject).toHaveBeenCalledWith("booking-1", "Date unavailable");
    expect(onRejected).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Reject booking")).not.toBeInTheDocument();
  });

  it("keeps the modal open when the API call fails", async () => {
    const user = userEvent.setup();
    mockedReject.mockResolvedValueOnce(null as never);
    renderModal();

    await user.click(screen.getByRole("button", { name: "Reject" }));
    await user.type(screen.getByRole("textbox"), "Reason");
    await user.click(screen.getByRole("button", { name: "Confirm rejection" }));

    expect(screen.getByText("Reject booking")).toBeInTheDocument();
  });
});
