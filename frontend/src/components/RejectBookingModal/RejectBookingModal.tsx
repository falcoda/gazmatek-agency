import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import ReasonActionModal from "@/components/ReasonActionModal/ReasonActionModal";
import { rejectAdminBooking } from "@/Utils/Services/Authenticated/adminAreaApi";

interface RejectBookingModalProps {
  bookingId: string;
  onRejected: () => void;
  triggerIcon?: ReactElement;
}

const RejectBookingModal = ({
  bookingId,
  onRejected,
  triggerIcon,
}: RejectBookingModalProps) => {
  const { t } = useTranslation();

  return (
    <ReasonActionModal
      triggerLabel={t("admin.bookings.reject")}
      triggerIcon={triggerIcon}
      modalTitle={t("admin.bookings.rejectModalTitle")}
      reasonLabel={t("admin.bookings.rejectReasonOptional")}
      reasonPlaceholder={t("admin.bookings.rejectReasonPlaceholder")}
      confirmLabel={t("admin.bookings.rejectConfirm")}
      successMessage={t("admin.bookings.rejected")}
      onSubmit={(reason) => rejectAdminBooking(bookingId, reason)}
      onSuccess={onRejected}
    />
  );
};

export default RejectBookingModal;
