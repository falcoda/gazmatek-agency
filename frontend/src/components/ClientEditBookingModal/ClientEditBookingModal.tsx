import "@/components/EditBookingModal/EditBookingModal.scss";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaEdit } from "react-icons/fa";

import ModalFooterActions from "@/components/ModalFooterActions/ModalFooterActions";
import {
  Button,
  Modal,
  StyledInputBase,
  StyledInputNumber,
  StyledInputText,
  StyledInputTextArea,
  useThemeMode,
} from "@/covaltech-react-ui";
import {
  MIN_BOOKING_LEAD_HOURS,
  minBookingDateTimeLocal,
} from "@/Utils/booking";
import { toDatetimeLocalValue } from "@/Utils/Date/date";
import {
  type AccountBookingDto,
  updateAccountBooking,
} from "@/Utils/Services/Authenticated/accountApi";

interface ClientEditBookingModalProps {
  booking: AccountBookingDto;
  onSaved: () => void;
}

interface FormState {
  eventDate: string;
  durationHours: string;
  location: string;
  context: string;
}

const buildInitialState = (booking: AccountBookingDto): FormState => ({
  eventDate: toDatetimeLocalValue(booking.eventDate),
  durationHours: String(booking.eventDurationHours ?? ""),
  location: booking.eventLocationAddress ?? "",
  context: booking.eventContext ?? "",
});

/**
 * Lets a client edit one of their own bookings while it is still in
 * `pending_validation`. Points at `PUT /api/account/bookings/:id`. (#30)
 */
const ClientEditBookingModal = ({
  booking,
  onSaved,
}: ClientEditBookingModalProps) => {
  const { t } = useTranslation();
  const themeMode = useThemeMode();
  const [form, setForm] = useState<FormState>(() => buildInitialState(booking));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(buildInitialState(booking));
  }, [booking]);

  const submit = async (): Promise<boolean> => {
    if (!form.eventDate) {
      toast.error(t("account.bookings.edit.errorMissingDate"));
      return false;
    }
    const parsed = new Date(form.eventDate);
    const earliest = Date.now() + MIN_BOOKING_LEAD_HOURS * 60 * 60 * 1000;
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() < earliest) {
      toast.error(
        t("bookingNew.errors.leadTime", { hours: MIN_BOOKING_LEAD_HOURS }),
      );
      return false;
    }
    const duration = Number(form.durationHours);
    if (!Number.isFinite(duration) || duration <= 0) {
      toast.error(t("bookingNew.errors.durationRequired"));
      return false;
    }
    setSubmitting(true);
    const result = await updateAccountBooking(booking.id, {
      eventDate: parsed.toISOString(),
      durationHours: duration,
      location: { address: form.location.trim() },
      context: form.context.trim() || null,
    });
    setSubmitting(false);
    if (!result) return false;
    toast.success(t("account.bookings.edit.saved"));
    onSaved();
    return true;
  };

  return (
    <Modal
      className={`editBookingModal ${themeMode === "dark" ? "dark" : "light"}`.trim()}
      modalButton={({ onClick }) => (
        <Button
          className="editTrigger"
          icon={<FaEdit />}
          onClick={onClick}
          style="square"
          title={t("account.bookings.edit.title")}
        />
      )}
      modalTitle={t("account.bookings.edit.title")}
      modalCancel={false}
      modalContent={
        <div className="editBookingForm">
          <StyledInputBase
            label={t("booking.fields.date")}
            value={form.eventDate}
            setValue={(v: string) => setForm({ ...form, eventDate: v })}
            type="datetime-local"
            htmlFor={`client-edit-booking-date-${booking.id}`}
          >
            <input
              id={`client-edit-booking-date-${booking.id}`}
              type="datetime-local"
              value={form.eventDate}
              min={minBookingDateTimeLocal()}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />
          </StyledInputBase>
          <StyledInputNumber
            label={t("booking.fields.duration")}
            value={form.durationHours}
            setValue={(v) => setForm({ ...form, durationHours: v ?? "" })}
            min="0.5"
            max="24"
          />
          <StyledInputText
            label={t("booking.fields.location")}
            value={form.location}
            setValue={(v) => setForm({ ...form, location: v })}
          />
          <StyledInputTextArea
            label={t("bookingNew.fields.context")}
            value={form.context}
            setValue={(v) => setForm({ ...form, context: v })}
            style={{ minHeight: "80px" }}
          />
        </div>
      }
      modalFooterButton={({ onClose }) => (
        <ModalFooterActions
          onClose={onClose}
          confirmLabel={t("common.save")}
          confirmStyle="blue"
          isLoading={submitting}
          onConfirm={submit}
        />
      )}
    />
  );
};

export default ClientEditBookingModal;
