import "./ReasonActionModal.scss";

import type { ReactElement } from "react";
import { useState } from "react";
import toast from "react-hot-toast";

import ModalFooterActions from "@/components/ModalFooterActions/ModalFooterActions";
import { Button, Modal, StyledInputTextArea } from "@/covaltech-react-ui";
import type { ButtonStyle } from "@/covaltech-react-ui/Button/Button";

interface ReasonActionModalProps {
  /** Label of the button that opens the modal. */
  triggerLabel: string;
  triggerIcon?: ReactElement;
  triggerStyle?: ButtonStyle;
  modalTitle: string;
  reasonLabel: string;
  reasonPlaceholder?: string;
  confirmLabel: string;
  confirmStyle?: ButtonStyle;
  successMessage: string;
  /**
   * Runs the action with the trimmed reason. Resolve to a falsy value to signal
   * failure (the modal stays open); any other value is treated as success.
   */
  onSubmit: (reason: string) => Promise<unknown>;
  onSuccess: () => void;
}

/**
 * Confirmation modal that collects a free-text reason before running a booking
 * action (reject, cancel, …). Shares its footer layout with every other modal
 * through {@link ModalFooterActions}.
 */
const ReasonActionModal = ({
  triggerLabel,
  triggerIcon,
  triggerStyle = "danger",
  modalTitle,
  reasonLabel,
  reasonPlaceholder,
  confirmLabel,
  confirmStyle = "danger",
  successMessage,
  onSubmit,
  onSuccess,
}: ReasonActionModalProps) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (): Promise<boolean> => {
    setSubmitting(true);
    const result = await onSubmit(reason.trim());
    setSubmitting(false);
    if (!result) return false;
    toast.success(successMessage);
    onSuccess();
    return true;
  };

  return (
    <Modal
      className="reasonActionModal"
      modalButton={({ onClick }) => (
        <Button
          label={triggerLabel}
          icon={triggerIcon}
          style={triggerStyle}
          onClick={onClick}
        />
      )}
      modalTitle={modalTitle}
      modalCancel={false}
      onClick={() => setReason("")}
      modalContent={
        <div className="reasonActionForm">
          <StyledInputTextArea
            label={reasonLabel}
            value={reason}
            setValue={setReason}
            placeholder={reasonPlaceholder}
            width="100%"
            style={{ minHeight: "120px" }}
          />
        </div>
      }
      modalFooterButton={({ onClose }) => (
        <ModalFooterActions
          onClose={onClose}
          confirmLabel={confirmLabel}
          confirmStyle={confirmStyle}
          isLoading={submitting}
          onConfirm={submit}
        />
      )}
    />
  );
};

export default ReasonActionModal;
