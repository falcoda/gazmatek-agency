import { useTranslation } from "react-i18next";

import ReasonActionModal from "@/components/ReasonActionModal/ReasonActionModal";
import { cancelAccountBooking } from "@/Utils/Services/Authenticated/accountApi";

interface CancelMyBookingModalProps {
  bookingId: string;
  onCancelled: () => void;
}

const CancelMyBookingModal = ({
  bookingId,
  onCancelled,
}: CancelMyBookingModalProps) => {
  const { t } = useTranslation();

  return (
    <ReasonActionModal
      triggerLabel={t("account.bookings.cancel.action")}
      modalTitle={t("account.bookings.cancel.modalTitle")}
      reasonLabel={t("account.bookings.cancel.reasonLabel")}
      reasonPlaceholder={t("account.bookings.cancel.reasonPlaceholder")}
      confirmLabel={t("account.bookings.cancel.confirm")}
      successMessage={t("account.bookings.cancel.success")}
      onSubmit={(reason) =>
        cancelAccountBooking(bookingId, reason || undefined)
      }
      onSuccess={onCancelled}
    />
  );
};

export default CancelMyBookingModal;
