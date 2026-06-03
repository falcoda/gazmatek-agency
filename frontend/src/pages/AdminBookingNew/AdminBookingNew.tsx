import "@/pages/ArtistDashboard/ArtistDashboard.scss";
import "./AdminBookingNew.scss";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import PublicAvailabilityCalendar from "@/components/PublicAvailabilityCalendar/PublicAvailabilityCalendar";
import SeoHead from "@/components/SeoHead/SeoHead";
import {
  BOOKING_STATUSES,
  type BookingStatus,
  bookingStatusLabel,
} from "@/config/bookingStatusLabels";
import { getPagePath } from "@/config/pages";
import {
  Button,
  Card,
  Checkbox,
  StyledDropdown,
  StyledInputBase,
  StyledInputEmail,
  StyledInputNumber,
  StyledInputText,
  StyledInputTextArea,
} from "@/covaltech-react-ui";
import { useLanguage } from "@/hooks/useLanguage";
import { useAdminAuthStore } from "@/stores/AdminAuthStore";
import {
  type AdminArtistRow,
  createAdminBooking,
  fetchAdminArtists,
} from "@/Utils/Services/Authenticated/adminAreaApi";
import { ArtistSetType } from "@/Utils/Services/Public/pricingApi";

const DEFAULT_EVENT_TIME = "20:00";

interface ArtistOption {
  id: string;
  name: string;
}

interface StatusOption {
  id: BookingStatus;
  name: string;
}

const AdminBookingNew = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useLanguage();
  const admin = useAdminAuthStore((s) => s.admin);

  const [artists, setArtists] = useState<AdminArtistRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    artistId: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    eventDate: "",
    eventDurationHours: 1,
    eventLocation: "",
    capacity: 500,
    ticketPriceEuros: 15,
    setType: ArtistSetType.DJ,
    quotedTotalCents: 0,
    depositAmountCents: 0,
    initialStatus: "confirmed" as BookingStatus,
    skipEmails: false,
    overrideConflict: false,
    internalNote: "",
  });

  useEffect(() => {
    if (!admin) return;
    // Load all artists for the dropdown — backend caps page_size at 100,
    // which is plenty for an agency roster.
    void fetchAdminArtists(undefined, 100).then((res) => {
      setArtists(res?.data ?? []);
    });
  }, [admin]);

  const artistOptions: ArtistOption[] = useMemo(
    () => artists.map((a) => ({ id: a.id, name: a.stage_name })),
    [artists],
  );

  const selectedArtist = artistOptions.find((a) => a.id === form.artistId);

  const statusOptions: StatusOption[] = useMemo(
    () =>
      BOOKING_STATUSES.map((status) => ({
        id: status,
        name: bookingStatusLabel(t, status),
      })),
    [t],
  );

  const selectedStatus =
    statusOptions.find((s) => s.id === form.initialStatus) ?? statusOptions[0];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.artistId || !form.eventDate) {
      toast.error(t("booking.errors.missingFields"));
      return;
    }
    setSubmitting(true);
    const result = await createAdminBooking({
      artistId: form.artistId,
      clientName: form.clientName.trim(),
      clientEmail: form.clientEmail.trim() || undefined,
      clientPhone: form.clientPhone.trim() || undefined,
      eventDate: new Date(form.eventDate).toISOString(),
      eventDurationHours: form.eventDurationHours,
      eventLocation: form.eventLocation.trim(),
      capacity: form.capacity,
      ticketPriceCents: Math.round(form.ticketPriceEuros * 100),
      setType: form.setType,
      // 0 means "use auto-pricing" — the backend recomputes via
      // computeArtistFee(level, capacity, ticketPrice, setType) when omitted.
      quotedTotalCents:
        form.quotedTotalCents > 0 ? form.quotedTotalCents : undefined,
      depositAmountCents:
        form.depositAmountCents > 0 ? form.depositAmountCents : undefined,
      initialStatus: form.initialStatus,
      skipEmails: form.skipEmails,
      overrideConflict: form.overrideConflict,
      internalNote: form.internalNote,
    });
    setSubmitting(false);
    if (result) {
      toast.success(t("admin.bookings.manualCreated"));
      navigate(getPagePath("adminBookings", language));
    }
  };

  const handleCalendarDayClick = (isoDate: string) => {
    setForm((prev) => {
      const currentTime = prev.eventDate.includes("T")
        ? prev.eventDate.split("T")[1]
        : DEFAULT_EVENT_TIME;
      return { ...prev, eventDate: `${isoDate}T${currentTime}` };
    });
  };

  return (
    <div className="artistDashboard adminBookingNew">
      <SeoHead
        title={t("admin.bookings.manualCreate")}
        description=""
        path="/admin/bookings/new"
      />
      <h1>{t("admin.bookings.manualCreate")}</h1>

      <div className="layout">
        <form onSubmit={submit} className="formColumn">
          <Card className="panel">
            <h2>{t("admin.bookings.sections.artist")}</h2>
            <div className="adminFormGrid">
              <StyledDropdown<ArtistOption>
                label={t("admin.bookings.col.artist")}
                value={selectedArtist}
                setValue={(o) => setForm({ ...form, artistId: o?.id ?? "" })}
                itemList={artistOptions}
                itemIdKey="id"
                itemLabelKey="name"
                width="100%"
                search
              />
            </div>
          </Card>

          <Card className="panel">
            <h2>{t("admin.bookings.sections.client")}</h2>
            <div className="adminFormGrid">
              <StyledInputText
                label={t("booking.fields.clientName")}
                value={form.clientName}
                setValue={(v) => setForm({ ...form, clientName: v })}
                required
              />
              <StyledInputEmail
                label={t("booking.fields.clientEmail")}
                value={form.clientEmail}
                setValue={(v) => setForm({ ...form, clientEmail: v })}
              />
              {form.clientEmail.trim() === "" ? (
                <p className="fieldWarning" role="note">
                  {t("admin.bookings.noEmailWarning")}
                </p>
              ) : null}
              <StyledInputText
                label={t("booking.fields.clientPhone")}
                value={form.clientPhone}
                setValue={(v) => setForm({ ...form, clientPhone: v })}
              />
            </div>
          </Card>

          <Card className="panel">
            <h2>{t("admin.bookings.sections.event")}</h2>
            <div className="adminFormGrid">
              <StyledInputBase
                label={t("booking.fields.date")}
                value={form.eventDate}
                setValue={(v: string) => setForm({ ...form, eventDate: v })}
                type="datetime-local"
                htmlFor="bk-date"
                width="100%"
              >
                <input
                  id="bk-date"
                  type="datetime-local"
                  value={form.eventDate}
                  onChange={(e) =>
                    setForm({ ...form, eventDate: e.target.value })
                  }
                  required
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
                value={form.eventLocation}
                setValue={(v) => setForm({ ...form, eventLocation: v })}
                required
              />
              <StyledInputNumber
                label={t("admin.bookings.fields.capacity")}
                value={String(form.capacity)}
                setValue={(v) => setForm({ ...form, capacity: Number(v ?? 0) })}
              />
              <StyledInputNumber
                label={t("admin.bookings.fields.ticketPrice")}
                value={String(form.ticketPriceEuros)}
                setValue={(v) =>
                  setForm({ ...form, ticketPriceEuros: Number(v ?? 0) })
                }
              />
              <StyledDropdown<{ id: ArtistSetType; name: string }>
                label={t("admin.bookings.fields.setType")}
                value={{
                  id: form.setType,
                  name: t(`bookingNew.fields.setType_${form.setType}`),
                }}
                setValue={(opt) =>
                  setForm({ ...form, setType: opt?.id ?? ArtistSetType.DJ })
                }
                itemList={[
                  ArtistSetType.DJ,
                  ArtistSetType.HYBRID,
                  ArtistSetType.LIVE,
                ].map((id) => ({
                  id,
                  name: t(`bookingNew.fields.setType_${id}`),
                }))}
                itemIdKey="id"
                itemLabelKey="name"
                width="100%"
              />
              <StyledInputNumber
                label={t("admin.bookings.fields.quotedTotalCents")}
                value={String(form.quotedTotalCents)}
                setValue={(v) =>
                  setForm({ ...form, quotedTotalCents: Number(v ?? 0) })
                }
              />
              <StyledInputNumber
                label={t("admin.bookings.fields.depositCents")}
                value={String(form.depositAmountCents)}
                setValue={(v) =>
                  setForm({ ...form, depositAmountCents: Number(v ?? 0) })
                }
              />
            </div>
          </Card>

          <Card className="panel">
            <h2>{t("admin.bookings.sections.adminControls")}</h2>
            <div className="adminFormGrid">
              <StyledDropdown<StatusOption>
                label={t("admin.bookings.fields.initialStatus")}
                value={selectedStatus}
                setValue={(o) =>
                  setForm({
                    ...form,
                    initialStatus: o?.id ?? "confirmed",
                  })
                }
                itemList={statusOptions}
                itemIdKey="id"
                itemLabelKey="name"
                width="100%"
              />
              <Checkbox
                checked={form.skipEmails}
                onChange={(c) => setForm({ ...form, skipEmails: c })}
                label={t("admin.bookings.fields.skipEmails")}
              />
              <Checkbox
                checked={form.overrideConflict}
                onChange={(c) => setForm({ ...form, overrideConflict: c })}
                label={t("admin.bookings.fields.overrideConflict")}
              />
            </div>
            <StyledInputTextArea
              label={t("admin.bookings.fields.internalNote")}
              value={form.internalNote}
              setValue={(v) => setForm({ ...form, internalNote: v })}
              style={{ minHeight: "100px" }}
            />
          </Card>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button
              type="button"
              label={t("common.back")}
              style="line"
              onClick={() => navigate(getPagePath("adminBookings", language))}
            />
            <Button
              type="submit"
              label={t("common.save")}
              style="blue"
              isLoading={submitting}
            />
          </div>
        </form>

        <aside className="sideColumn">
          <Card className="panel sidePanel">
            <h2>{t("admin.bookings.calendarPreview.title")}</h2>
            {form.artistId ? (
              <>
                <p className="sideHint">
                  {t("admin.bookings.calendarPreview.clickHint")}
                </p>
                <div className="miniCalendar">
                  <PublicAvailabilityCalendar
                    artistId={form.artistId}
                    monthsAhead={2}
                    onDayClick={handleCalendarDayClick}
                  />
                </div>
              </>
            ) : (
              <p className="sideHint">
                {t("admin.bookings.calendarPreview.hint")}
              </p>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default AdminBookingNew;
