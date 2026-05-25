import { renderWithProviders, screen, userEvent } from "@tests/testUtils";
import { describe, expect, it, vi } from "vitest";

import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";

const renderConfirmModal = (
  overrides: Partial<Parameters<typeof ConfirmModal>[0]> = {},
) =>
  renderWithProviders(
    <ConfirmModal
      confirmLabel="Confirm"
      modalTitle="Confirm action"
      modalContent={<p>Are you sure?</p>}
      onConfirm={vi.fn()}
      trigger={({ onClick }) => (
        <button type="button" onClick={onClick}>
          Open
        </button>
      )}
      {...overrides}
    />,
  );

describe("ConfirmModal", () => {
  it("renders the trigger and stays closed initially", () => {
    renderConfirmModal();

    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });

  it("opens the modal with title, content and confirm button", async () => {
    const user = userEvent.setup();
    renderConfirmModal();

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByText("Confirm action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("calls onConfirm and closes the modal on confirm", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderConfirmModal({ onConfirm });

    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });

  it("keeps the modal open when onConfirm returns false", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(() => false);
    renderConfirmModal({ onConfirm });

    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("closes the modal when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderConfirmModal();

    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });
});
