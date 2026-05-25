import "./DeleteConfirmModal.scss";

import type { ReactElement } from "react";
import { FaTrash } from "react-icons/fa";

import { Button, Modal, useThemeMode } from "@/covaltech-react-ui";

interface DeleteConfirmModalProps {
  /** Accessible title for the trash trigger button. */
  buttonTitle: string;
  className?: string;
  /** Label of the destructive confirm button. */
  confirmLabel: string;
  isLoading?: boolean;
  /** Body content of the modal. */
  modalContent: ReactElement;
  /** Title of the modal. */
  modalTitle: ReactElement | string;
  /**
   * Confirm handler. Returning `false` keeps the modal open (e.g. on error);
   * any other value closes it.
   */
  onConfirm: () => Promise<boolean | void> | boolean | void;
  /** Optional callback fired when the modal opens. */
  onOpen?: () => void;
}

/**
 * Closes the open `covaltech-react-ui` Modal. That Modal exposes no imperative
 * close handle to its footer slot, but it listens for an `Escape` keydown on
 * `document`, so dispatching one is the supported way to close it after a
 * successful confirm.
 */
const closeOpenModal = () => {
  document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
};

/**
 * Generic delete-confirmation modal. Renders a trash trigger button and a
 * modal whose title, content and confirm label come from props.
 */
const DeleteConfirmModal = ({
  buttonTitle,
  className,
  confirmLabel,
  isLoading = false,
  modalContent,
  modalTitle,
  onConfirm,
  onOpen,
}: DeleteConfirmModalProps) => {
  const themeMode = useThemeMode();

  return (
    <Modal
      className={`deleteConfirmModal ${
        themeMode === "dark" ? "dark" : "light"
      } ${className ?? ""}`.trim()}
      onClick={onOpen}
      modalButton={({ onClick }) => (
        <Button
          className="deleteTrigger"
          icon={<FaTrash />}
          onClick={onClick}
          style="square"
          title={buttonTitle}
        />
      )}
      modalTitle={modalTitle}
      modalContent={modalContent}
      modalFooterButton={
        <Button
          label={confirmLabel}
          style="danger"
          isLoading={isLoading}
          onClick={async () => {
            const result = await onConfirm();
            if (result !== false) {
              closeOpenModal();
            }
          }}
        />
      }
    />
  );
};

export default DeleteConfirmModal;
