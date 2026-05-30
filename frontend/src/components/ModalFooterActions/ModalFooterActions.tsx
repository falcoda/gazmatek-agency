import "./ModalFooterActions.scss";

import { useTranslation } from "react-i18next";

import { Button } from "@/covaltech-react-ui";
import type { ButtonStyle } from "@/covaltech-react-ui/Button/Button";

interface ModalFooterActionsProps {
  /** Close handle provided by the `covaltech-react-ui` Modal footer render prop. */
  onClose: () => void;
  confirmLabel: string;
  confirmStyle?: ButtonStyle;
  isLoading?: boolean;
  /** Returns `true` to close the modal after success, `false` to keep it open. */
  onConfirm: () => Promise<boolean>;
}

/**
 * Standard modal footer: a bordered "Cancel" button that closes the modal and a
 * primary action button that runs `onConfirm` and closes the modal on success.
 */
const ModalFooterActions = ({
  onClose,
  confirmLabel,
  confirmStyle = "blue",
  isLoading = false,
  onConfirm,
}: ModalFooterActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="modalFooterActions">
      <Button label={t("common.cancel")} style="bordered" onClick={onClose} />
      <Button
        label={confirmLabel}
        style={confirmStyle}
        isLoading={isLoading}
        onClick={async () => {
          const ok = await onConfirm();
          if (ok) onClose();
        }}
      />
    </div>
  );
};

export default ModalFooterActions;
