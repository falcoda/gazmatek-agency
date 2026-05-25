import { renderWithProviders, screen, userEvent } from "@tests/testUtils";
import { describe, expect, it, vi } from "vitest";

import DeleteConfirmModal from "@/components/DeleteConfirmModal/DeleteConfirmModal";

const renderDeleteModal = (
  overrides: Partial<Parameters<typeof DeleteConfirmModal>[0]> = {},
) =>
  renderWithProviders(
    <DeleteConfirmModal
      buttonTitle="Delete item"
      confirmLabel="Delete"
      modalTitle="Delete item"
      modalContent={<p>This cannot be undone.</p>}
      onConfirm={vi.fn()}
      {...overrides}
    />,
  );

describe("DeleteConfirmModal", () => {
  it("renders the trash trigger button", () => {
    renderDeleteModal();

    expect(
      screen.getByRole("button", { name: "Delete item" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("This cannot be undone."),
    ).not.toBeInTheDocument();
  });

  it("opens the modal when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderDeleteModal();

    await user.click(screen.getByRole("button", { name: "Delete item" }));

    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("fires onOpen when the modal opens", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    renderDeleteModal({ onOpen });

    await user.click(screen.getByRole("button", { name: "Delete item" }));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm and closes the modal on confirm", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderDeleteModal({ onConfirm });

    await user.click(screen.getByRole("button", { name: "Delete item" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("This cannot be undone."),
    ).not.toBeInTheDocument();
  });

  it("keeps the modal open when onConfirm returns false", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(() => false);
    renderDeleteModal({ onConfirm });

    await user.click(screen.getByRole("button", { name: "Delete item" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("closes the modal when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderDeleteModal();

    await user.click(screen.getByRole("button", { name: "Delete item" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByText("This cannot be undone."),
    ).not.toBeInTheDocument();
  });
});
