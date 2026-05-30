import "./EditBookingModal.scss";

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
  type AdminBookingRow,
  type AdminBookingUpdatePayload,
  updateAdminBooking,
} from "@/Utils/Services/Authenticated/adminAreaApi";

interface EditBookingModalProps {
  booking: AdminBookingRow;
  onSaved: () => void;
}

const toDatetimeLocal = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const centsToEurosInput = (cents: number): string =>
  Number.isFinite(cents) ? (cents / 100).toFixed(2) : "";

const eurosInputToCents = (value: string): number => {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
};

interface FormState {
  eventDate: string;
  eventDurationHours: number;
  eventLocationAddress: string;
  eventContext: string;
  quotedTotalEuros: string;
  depositEuros: string;
}

const buildInitialState = (booking: AdminBookingRow): FormState => ({
  eventDate: toDatetimeLocal(booking.event_date),
  eventDurationHours: Number(booking.event_duration_hours ?? 0),
  eventLocationAddress: booking.event_location_address ?? "",
  eventContext: "",
  quotedTotalEuros: centsToEurosInput(booking.quoted_total_cents),
  depositEuros: centsToEurosInput(booking.deposit_amount_cents),
});

const EditBookingModal = ({ booking, onSaved }: EditBookingModalProps) => {
  const { t } = useTranslation();
  const themeMode = useThemeMode();
  const [form, setForm] = useState<FormState>(() => buildInitialState(booking));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(buildInitialState(booking));
  }, [booking]);

  const submit = async (): Promise<boolean> => {
    if (!form.eventDate) {
      toast.error(t("admin.bookings.edit.errorMissingDate"));
      return false;
    }
    setSubmitting(true);
    const payload: AdminBookingUpdatePayload = {
      eventDate: new Date(form.eventDate).toISOString(),
      eventDurationHours: Number(form.eventDurationHours),
      eventLocationAddress: form.eventLocationAddress.trim(),
      eventContext: form.eventContext.trim() || null,
      quotedTotalCents: eurosInputToCents(form.quotedTotalEuros),
      depositAmountCents: eurosInputToCents(form.depositEuros),
    };
    const result = await updateAdminBooking(booking.id, payload);
    setSubmitting(false);
    if (!result) return false;
    toast.success(t("admin.bookings.edit.saved"));
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
          title={t("admin.bookings.edit.title")}
        />
      )}
      modalTitle={t("admin.bookings.edit.title")}
      modalCancel={false}
      modalContent={
        <div className="editBookingForm">
          <StyledInputBase
            label={t("booking.fields.date")}
            value={form.eventDate}
            setValue={(v: string) => setForm({ ...form, eventDate: v })}
            type="datetime-local"
            htmlFor={`edit-booking-date-${booking.id}`}
          >
            <input
              id={`edit-booking-date-${booking.id}`}
              type="datetime-local"
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />
          </StyledInputBase>
          <StyledInputNumber
            label={t("booking.fields.duration")}
            value={String(form.eventDurationHours)}
            setValue={(v) =>
              setForm({ ...form, eventDurationHours: Number(v ?? 0) })
            }
          />
          <StyledInputText
            label={t("booking.fields.location")}
            value={form.eventLocationAddress}
            setValue={(v) => setForm({ ...form, eventLocationAddress: v })}
          />
          <StyledInputNumber
            label={t("admin.bookings.fields.quotedTotalEuros")}
            value={form.quotedTotalEuros}
            setValue={(v) => setForm({ ...form, quotedTotalEuros: v ?? "" })}
            min="0"
            wrapInputText="€"
          />
          <StyledInputNumber
            label={t("admin.bookings.fields.depositEuros")}
            value={form.depositEuros}
            setValue={(v) => setForm({ ...form, depositEuros: v ?? "" })}
            min="0"
            wrapInputText="€"
          />
          <StyledInputTextArea
            label={t("admin.bookings.fields.internalNote")}
            value={form.eventContext}
            setValue={(v) => setForm({ ...form, eventContext: v })}
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

export default EditBookingModal;
