import { render, screen, userEvent } from "@tests/testUtils";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

import Modal from "@/components/Modal/Modal";

interface RenderModalOptions {
  modalTitle?: string;
  modalCancel?: boolean;
  onClick?: () => void;
}

const renderModal = ({
  modalTitle = "Confirm action",
  modalCancel = true,
  onClick,
}: RenderModalOptions = {}) =>
  render(
    <Modal
      modalButton={({ onClick: open }) => (
        <button type="button" onClick={open}>
          Open modal
        </button>
      )}
      modalTitle={modalTitle}
      modalContent={<p>Modal body content</p>}
      modalFooterButton={
        (<button type="button">Confirm</button>) as ReactElement
      }
      modalCancel={modalCancel}
      onClick={onClick}
    />,
  );

describe("Modal", () => {
  it("renders the trigger button and stays closed initially", () => {
    renderModal();

    expect(
      screen.getByRole("button", { name: "Open modal" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Modal body content")).not.toBeInTheDocument();
  });

  it("opens the modal when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "Open modal" }));

    expect(screen.getByText("Modal body content")).toBeInTheDocument();
    expect(screen.getByText("Confirm action")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("invokes the onClick callback when opened", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderModal({ onClick });

    await user.click(screen.getByRole("button", { name: "Open modal" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a Cancel button when modalCancel is true", async () => {
    const user = userEvent.setup();
    renderModal({ modalCancel: true });

    await user.click(screen.getByRole("button", { name: "Open modal" }));

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("omits the Cancel button when modalCancel is false", async () => {
    const user = userEvent.setup();
    renderModal({ modalCancel: false });

    await user.click(screen.getByRole("button", { name: "Open modal" }));

    expect(
      screen.queryByRole("button", { name: "Cancel" }),
    ).not.toBeInTheDocument();
  });

  it("closes the modal when the Cancel button is clicked", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "Open modal" }));
    expect(screen.getByText("Modal body content")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Modal body content")).not.toBeInTheDocument();
  });

  it("closes the modal when the Escape key is pressed", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "Open modal" }));
    expect(screen.getByText("Modal body content")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByText("Modal body content")).not.toBeInTheDocument();
  });

  it("renders the title element when a modalTitle is provided", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderModal({ modalTitle: "Delete item" });

    await user.click(screen.getByRole("button", { name: "Open modal" }));

    const title = baseElement.querySelector(".modalTitle");
    expect(title?.textContent).toBe("Delete item");
  });
});
