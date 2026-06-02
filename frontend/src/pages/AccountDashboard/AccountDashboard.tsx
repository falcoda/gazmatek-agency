import "@/pages/ArtistDashboard/ArtistDashboard.scss";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import CancelMyBookingModal from "@/components/CancelMyBookingModal/CancelMyBookingModal";
import ClientEditBookingModal from "@/components/ClientEditBookingModal/ClientEditBookingModal";
import SeoHead from "@/components/SeoHead/SeoHead";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import {
  BOOKING_STATUS_TONE,
  type BookingStatus,
  bookingStatusLabel,
} from "@/config/bookingStatusLabels";
import { getPagePath } from "@/config/pages";
import {
  Button,
  ButtonSwitcher,
  type ButtonSwitcherValue,
  Card,
  type Column,
  DynamicTable,
} from "@/covaltech-react-ui";
import { useLanguage } from "@/hooks/useLanguage";
import { useClientAuthStore } from "@/stores/ClientAuthStore";
import { MIN_BOOKING_LEAD_HOURS } from "@/Utils/booking";
import { formatPriceCents } from "@/Utils/formatPrice";
import { localeFromLang } from "@/Utils/locale";
import {
  type AccountBookingDto,
  fetchAccountBookings,
  logoutAccount,
} from "@/Utils/Services/Authenticated/accountApi";

// Mirrors backend `MIN_LEAD_TIME_HOURS` — cancellations within this window
// are refused by the API. We hide the button instead of letting the user
// click into a 409.
const CANCEL_MIN_LEAD_HOURS = MIN_BOOKING_LEAD_HOURS;
const CANCELLABLE_STATUSES: ReadonlySet<BookingStatus> = new Set([
  "pending_validation",
  "awaiting_deposit",
  "confirmed",
]);

type TabId = "upcoming" | "past" | "cancelled" | "all";

interface AccountBookingRow extends AccountBookingDto {
  artistStageName: string;
}

const AccountDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useLanguage();
  const { client, token, refreshToken, clear } = useClientAuthStore();
  const [bookings, setBookings] = useState<AccountBookingDto[]>([]);
  // Distinguishes "the fetch failed" (null) from "the client has no bookings"
  // (empty list) so the UI can show an error rather than a misleading empty
  // state. (#18)
  const [loadFailed, setLoadFailed] = useState(false);

  const tabs: ButtonSwitcherValue[] = useMemo(
    () => [
      { id: "upcoming", name: t("account.bookings.tabs.upcoming") },
      { id: "past", name: t("account.bookings.tabs.past") },
      { id: "cancelled", name: t("account.bookings.tabs.cancelled") },
      { id: "all", name: t("account.bookings.tabs.all") },
    ],
    [t],
  );
  const [activeTab, setActiveTab] = useState<ButtonSwitcherValue>(tabs[0]);

  const reload = useCallback(async () => {
    const res = await fetchAccountBookings();
    if (res === null) {
      setLoadFailed(true);
      return;
    }
    setLoadFailed(false);
    setBookings(res.bookings);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate(getPagePath("accountLogin", language), { replace: true });
      return;
    }
    void reload();
  }, [token, navigate, language, reload]);

  const logout = async () => {
    await logoutAccount(refreshToken);
    clear();
    navigate(getPagePath("accountLogin", language));
  };

  const filtered = useMemo<AccountBookingRow[]>(() => {
    const now = new Date();
    const filterByTab = (() => {
      switch (activeTab.id as TabId) {
        case "upcoming":
          return bookings.filter(
            (b) => b.status !== "cancelled" && new Date(b.eventDate) >= now,
          );
        case "past":
          return bookings.filter(
            (b) => b.status !== "cancelled" && new Date(b.eventDate) < now,
          );
        case "cancelled":
          return bookings.filter((b) => b.status === "cancelled");
        case "all":
        default:
          return bookings;
      }
    })();
    // Flatten `artist.stageName` so DynamicTable's string `dataIndex` works.
    return filterByTab.map((b) => ({
      ...b,
      artistStageName: b.artist.stageName,
    }));
  }, [bookings, activeTab]);

  const labelForStatus = (status: string): string =>
    bookingStatusLabel(t, status);

  const columns: Column[] = useMemo(
    () => [
      {
        title: t("admin.bookings.col.date"),
        dataIndex: "eventDate",
        sortable: true,
        render: (value: string) =>
          new Date(value).toLocaleString(localeFromLang(language)),
        mobile: { visible: true, order: 0, titleVisible: true },
      },
      {
        title: t("admin.bookings.col.artist"),
        dataIndex: "artistStageName",
        sortable: true,
        mobile: { visible: true, order: 1, titleVisible: true },
      },
      {
        title: t("artistArea.col.location"),
        dataIndex: "eventLocationAddress",
        mobile: { visible: true, order: 2, titleVisible: true },
      },
      {
        title: t("admin.bookings.col.status"),
        dataIndex: "status",
        render: (value: string) => (
          <StatusBadge
            tone={BOOKING_STATUS_TONE[value as BookingStatus] ?? "neutral"}
          >
            {labelForStatus(value)}
          </StatusBadge>
        ),
        mobile: { visible: true, order: 3, titleVisible: true },
      },
      {
        title: t("admin.bookings.col.total"),
        dataIndex: "quotedTotalCents",
        render: (value: number) => formatPriceCents(value, language),
        mobile: { visible: true, order: 4, titleVisible: true },
      },
      {
        title: "",
        dataIndex: "id",
        render: (_value: string, record: AccountBookingRow) => {
          const status = record.status as BookingStatus;
          const leadMs = CANCEL_MIN_LEAD_HOURS * 60 * 60 * 1000;
          const cancellable =
            CANCELLABLE_STATUSES.has(status) &&
            new Date(record.eventDate).getTime() - Date.now() > leadMs;
          // The backend only allows client edits while the booking is still
          // pending validation. (#30)
          const editable = status === "pending_validation";
          // Stop click propagation so the row's default click (if any) does
          // not fire alongside the modal trigger.
          return (
            <div
              style={{ display: "flex", gap: 8 }}
              onClick={(e) => e.stopPropagation()}
            >
              {editable ? (
                <ClientEditBookingModal
                  booking={record}
                  onSaved={() => {
                    void reload();
                  }}
                />
              ) : null}
              {cancellable ? (
                <CancelMyBookingModal
                  bookingId={record.id}
                  onCancelled={() => {
                    void reload();
                  }}
                />
              ) : null}
            </div>
          );
        },
        mobile: { visible: true, order: 5, titleVisible: false },
      },
    ],
    [t, language, reload],
  );

  return (
    <div className="artistDashboard">
      <SeoHead
        title={t("account.dashboard.title")}
        description=""
        path="/account"
      />
      <header className="header">
        <div>
          <h1>{t("account.dashboard.title")}</h1>
          <p>
            {t("account.dashboard.welcome", {
              name: client?.displayName ?? client?.email ?? "",
            })}
          </p>
        </div>
        <div className="actions">
          <Button label={t("auth.signOut")} style="danger" onClick={logout} />
        </div>
      </header>

      <Card className="panel">
        <ButtonSwitcher
          value={activeTab}
          setValue={setActiveTab}
          datas={tabs}
        />
      </Card>

      <Card className="panel">
        {loadFailed ? (
          <div className="loadError" role="alert">
            <p>{t("account.bookings.loadError")}</p>
            <Button
              label={t("common.retry")}
              style="bordered"
              onClick={() => {
                void reload();
              }}
            />
          </div>
        ) : (
          <DynamicTable
            data={filtered}
            columns={columns}
            pagined
            mobile
            tableId={`account-bookings-${activeTab.id}`}
          />
        )}
      </Card>
    </div>
  );
};

export default AccountDashboard;
