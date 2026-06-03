import "@/pages/ArtistDashboard/ArtistDashboard.scss";

import type { EventInput } from "@fullcalendar/core";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import AvailabilityCalendar from "@/components/AvailabilityCalendar/AvailabilityCalendar";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import SeoHead from "@/components/SeoHead/SeoHead";
import {
  Button,
  Card,
  Modal,
  NoData,
  StyledDropdown,
  StyledInputBase,
  StyledInputText,
} from "@/covaltech-react-ui";
import { useArtistAuthStore } from "@/stores/ArtistAuthStore";
import { toDatetimeLocalValue } from "@/Utils/Date/date";
import {
  type ArtistUnavailabilityDto,
  createArtistUnavailability,
  deleteArtistUnavailability,
  fetchArtistUnavailabilities,
} from "@/Utils/Services/Authenticated/artistAreaApi";

type UnavailabilitySource = "personal" | "external_gig";

interface SourceOption {
  id: UnavailabilitySource;
  name: string;
}

const RANGE_DAYS = 90;

// FullCalendar event colors cannot read SCSS theme variables (they are applied
// as inline styles in JS), so they are centralized here and kept in sync with
// the theme: $main-orange (external gig), $lock-color (personal/unavailable),
// $primary-color (event text on colored background).
const CALENDAR_COLORS = {
  externalGig: "#ff8e00", // $main-orange
  personal: "#d11b1b", // $lock-color
  eventText: "#0b0b0d", // $primary-color
} as const;

const ArtistCalendar = () => {
  const { t } = useTranslation();
  const artist = useArtistAuthStore((s) => s.artist);
  const [unavail, setUnavail] = useState<ArtistUnavailabilityDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  // Unavailability picked from the calendar that is pending delete-confirmation.
  // Keyed by id so the controlled confirmation modal re-mounts (and re-opens)
  // on each calendar event click. (#32)
  const [pendingDelete, setPendingDelete] =
    useState<ArtistUnavailabilityDto | null>(null);
  const [form, setForm] = useState({
    startsAt: "",
    endsAt: "",
    source: "personal" as UnavailabilitySource,
    externalEventTitle: "",
    notes: "",
  });

  const sourceOptions: SourceOption[] = useMemo(
    () => [
      { id: "personal", name: t("artistArea.calendar.personal") },
      { id: "external_gig", name: t("artistArea.calendar.externalGig") },
    ],
    [t],
  );

  const selectedSource =
    sourceOptions.find((option) => option.id === form.source) ??
    sourceOptions[0];

  const calendarEvents: EventInput[] = useMemo(
    () =>
      unavail.map((u) => ({
        id: u.id,
        title:
          u.source === "external_gig"
            ? (u.externalEventTitle ?? t("artistArea.calendar.externalGig"))
            : t("artistArea.calendar.personal"),
        start: u.startsAt,
        end: u.endsAt,
        backgroundColor:
          u.source === "external_gig"
            ? CALENDAR_COLORS.externalGig
            : CALENDAR_COLORS.personal,
        borderColor:
          u.source === "external_gig"
            ? CALENDAR_COLORS.externalGig
            : CALENDAR_COLORS.personal,
        textColor: CALENDAR_COLORS.eventText,
      })),
    [unavail, t],
  );

  const reload = async () => {
    if (!artist) return;
    const from = new Date().toISOString();
    const to = new Date(
      Date.now() + RANGE_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    const res = await fetchArtistUnavailabilities(from, to);
    setUnavail(res?.data ?? []);
  };

  useEffect(() => {
    void reload();
  }, [artist]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist || !form.startsAt || !form.endsAt) return;
    setSubmitting(true);
    const payload = {
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      source: form.source,
      externalEventTitle:
        form.source === "external_gig" ? form.externalEventTitle : undefined,
      notes: form.notes || undefined,
    };
    const result = await createArtistUnavailability(payload);
    setSubmitting(false);
    if (result) {
      toast.success(t("artistArea.calendar.created"));
      setForm({ ...form, externalEventTitle: "", notes: "" });
      await reload();
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    if (!artist) return false;
    await deleteArtistUnavailability(id);
    await reload();
    return true;
  };

  return (
    <div className="artistDashboard">
      <SeoHead
        title={t("artistArea.calendar.title")}
        description=""
        path="/artist/calendar"
      />
      <h1>{t("artistArea.calendar.title")}</h1>

      <Card className="panel">
        <h2>{t("artistArea.calendar.add")}</h2>
        <form onSubmit={submit} className="adminFormGrid">
          <StyledInputBase
            label={t("artistArea.calendar.startsAt")}
            value={form.startsAt}
            setValue={(v: string) => setForm({ ...form, startsAt: v })}
            type="datetime-local"
            htmlFor="startsAt"
            width="100%"
          >
            <input
              id="startsAt"
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              required
            />
          </StyledInputBase>
          <StyledInputBase
            label={t("artistArea.calendar.endsAt")}
            value={form.endsAt}
            setValue={(v: string) => setForm({ ...form, endsAt: v })}
            type="datetime-local"
            htmlFor="endsAt"
            width="100%"
          >
            <input
              id="endsAt"
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              required
            />
          </StyledInputBase>
          <StyledDropdown<SourceOption>
            label={t("artistArea.calendar.type")}
            value={selectedSource}
            setValue={(option) =>
              setForm({ ...form, source: option?.id ?? "personal" })
            }
            itemList={sourceOptions}
            itemIdKey="id"
            itemLabelKey="name"
            width="100%"
          />
          {form.source === "external_gig" ? (
            <StyledInputText
              label={t("artistArea.calendar.eventTitle")}
              value={form.externalEventTitle}
              setValue={(v) => setForm({ ...form, externalEventTitle: v })}
              required
            />
          ) : null}
          <StyledInputText
            label={t("artistArea.calendar.notes")}
            value={form.notes}
            setValue={(v) => setForm({ ...form, notes: v })}
          />
          <Button
            type="submit"
            label={t("common.submit")}
            style="blue"
            isLoading={submitting}
          />
        </form>
      </Card>

      <Card className="panel">
        <h2>{t("artistArea.calendar.title")}</h2>
        <AvailabilityCalendar
          events={calendarEvents}
          mode="artist"
          onSelectRange={(range) => {
            // Build the datetime-local value from LOCAL clock components so the
            // selected slot is not shifted by the UTC offset. (#19)
            setForm({
              ...form,
              startsAt: toDatetimeLocalValue(range.start),
              endsAt: toDatetimeLocalValue(range.end),
            });
          }}
          onSelectEvent={(eventId) => {
            // Clicking an event opens a delete-confirmation rather than deleting
            // immediately. (#32)
            const target = unavail.find((u) => u.id === eventId);
            if (target) setPendingDelete(target);
          }}
        />
      </Card>

      {pendingDelete ? (
        <Modal
          key={pendingDelete.id}
          defaultOpen
          modalTitle={t("artistArea.calendar.deleteTitle")}
          modalCancel={false}
          modalButton={() => <span style={{ display: "none" }} />}
          modalContent={
            <p>
              {t("artistArea.calendar.deleteConfirm", {
                start: new Date(pendingDelete.startsAt).toLocaleString(),
                end: new Date(pendingDelete.endsAt).toLocaleString(),
              })}
            </p>
          }
          modalFooterButton={({ onClose }) => (
            <Button
              label={t("common.delete")}
              style="danger"
              onClick={async () => {
                await remove(pendingDelete.id);
                setPendingDelete(null);
                onClose();
              }}
            />
          )}
        />
      ) : null}

      <Card className="panel">
        <h2>{t("artistArea.calendar.list")}</h2>
        {unavail.length === 0 ? (
          <NoData />
        ) : (
          <ul className="adminArtistList">
            {unavail.map((u) => (
              <li key={u.id} className="row">
                <div className="info">
                  <strong>{new Date(u.startsAt).toLocaleString()}</strong>
                  <span>→ {new Date(u.endsAt).toLocaleString()}</span>
                  <span>({u.source})</span>
                  {u.externalEventTitle ? (
                    <span>— {u.externalEventTitle}</span>
                  ) : null}
                </div>
                <div className="actions">
                  <ConfirmModal
                    modalTitle={t("artistArea.calendar.deleteTitle")}
                    modalContent={
                      <p>
                        {t("artistArea.calendar.deleteConfirm", {
                          start: new Date(u.startsAt).toLocaleString(),
                          end: new Date(u.endsAt).toLocaleString(),
                        })}
                      </p>
                    }
                    confirmLabel={t("common.delete")}
                    confirmStyle="danger"
                    onConfirm={() => remove(u.id)}
                    trigger={({ onClick }) => (
                      <Button
                        label={t("common.delete")}
                        style="danger"
                        onClick={onClick}
                      />
                    )}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default ArtistCalendar;
