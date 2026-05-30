import type { ReactElement } from "react";

import { Button, Modal } from "@/covaltech-react-ui";

type ConfirmStyle = "blue" | "danger" | "white" | "line" | "transparent";

interface ConfirmModalProps {
  /** Label of the confirm button. */
  confirmLabel: string;
  /** Visual style of the confirm button. Defaults to `"blue"`. */
  confirmStyle?: ConfirmStyle;
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
  /** Render prop for the element that opens the modal. */
  trigger: (props: { onClick: () => void }) => ReactElement;
}

/**
 * Generic confirmation modal. Wraps the `covaltech-react-ui` Modal and exposes
 * title, content, confirm label and confirm handler through props.
 */
const ConfirmModal = ({
  confirmLabel,
  confirmStyle = "blue",
  isLoading = false,
  modalContent,
  modalTitle,
  onConfirm,
  trigger,
}: ConfirmModalProps) => {
  return (
    <Modal
      modalButton={trigger}
      modalTitle={modalTitle}
      modalContent={modalContent}
      modalFooterButton={({ onClose }) => (
        <Button
          label={confirmLabel}
          style={confirmStyle}
          isLoading={isLoading}
          onClick={async () => {
            const result = await onConfirm();
            if (result !== false) {
              onClose();
            }
          }}
        />
      )}
    />
  );
};

export default ConfirmModal;
