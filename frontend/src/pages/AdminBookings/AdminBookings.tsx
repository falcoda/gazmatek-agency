import "@/pages/ArtistDashboard/ArtistDashboard.scss";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import EditBookingModal from "@/components/EditBookingModal/EditBookingModal";
import RejectBookingModal from "@/components/RejectBookingModal/RejectBookingModal";
import SeoHead from "@/components/SeoHead/SeoHead";
import {
  BOOKING_STATUSES,
  bookingStatusLabel,
} from "@/config/bookingStatusLabels";
import { buildAdminBookingDetailPath, getPagePath } from "@/config/pages";
import {
  Button,
  Card,
  type Column,
  DynamicTable,
  StyledDropdown,
} from "@/covaltech-react-ui";
import { useLanguage } from "@/hooks/useLanguage";
import { useAdminAuthStore } from "@/stores/AdminAuthStore";
import {
  bookingStatusColumn,
  eventDateColumn,
  totalCentsColumn,
} from "@/Utils/bookingColumns";
import {
  type AdminBookingRow,
  approveAdminBooking,
  fetchAdminBookings,
  markAdminBookingCompleted,
  markAdminBookingDepositPaid,
} from "@/Utils/Services/Authenticated/adminAreaApi";

interface StatusOption {
  id: string;
  name: string;
}

const AdminBookings = () => {
  const { t } = useTranslation();
  const language = useLanguage();
  const navigate = useNavigate();
  const token = useAdminAuthStore((s) => s.token);
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusOption | undefined>(
    undefined,
  );

  const statusOptions: StatusOption[] = useMemo(
    () => [
      { id: "", name: t("common.all") },
      ...BOOKING_STATUSES.map((status) => ({
        id: status,
        name: bookingStatusLabel(t, status),
      })),
    ],
    [t],
  );

  const reload = async () => {
    if (!token) return;
    const res = await fetchAdminBookings({
      status: statusFilter?.id || undefined,
    });
    setBookings(res?.data ?? []);
    setTotal(res?.pagination.total ?? 0);
  };

  useEffect(() => {
    void reload();
  }, [token, statusFilter]);

  const approve = async (id: string) => {
    if (!token) return;
    const res = await approveAdminBooking(id);
    if (res) toast.success(t("admin.bookings.approved"));
    await reload();
  };

  const markDepositPaid = async (id: string) => {
    if (!token) return;
    if (!window.confirm(t("admin.bookings.markDepositPaidConfirm"))) return;
    const res = await markAdminBookingDepositPaid(id);
    if (res) toast.success(t("admin.bookings.markDepositPaidSuccess"));
    await reload();
  };

  const markCompleted = async (id: string) => {
    if (!token) return;
    if (!window.confirm(t("admin.bookings.markCompletedConfirm"))) return;
    const res = await markAdminBookingCompleted(id);
    if (res) toast.success(t("admin.bookings.markCompletedSuccess"));
    await reload();
  };

  const bookingColumns: Column[] = useMemo(
    () => [
      {
        title: t("admin.bookings.col.artist"),
        dataIndex: "artist_stage_name",
        sortable: true,
        mobile: { visible: true, order: 0, titleVisible: true },
      },
      {
        title: t("admin.bookings.col.client"),
        dataIndex: "client_name",
        sortable: true,
        mobile: { visible: true, order: 1, titleVisible: true },
      },
      eventDateColumn(language, {
        title: t("admin.bookings.col.date"),
        dataIndex: "event_date",
        order: 2,
      }),
      bookingStatusColumn(t, {
        title: t("admin.bookings.col.status"),
        dataIndex: "status",
        order: 3,
      }),
      totalCentsColumn(language, {
        title: t("admin.bookings.col.total"),
        dataIndex: "quoted_total_cents",
        order: 4,
      }),
      {
        title: "",
        dataIndex: "id",
        colunmWidth: "320px",
        render: (_value: string, record: AdminBookingRow) => {
          const actions: React.ReactNode[] = [
            <EditBookingModal
              key="edit"
              booking={record}
              onSaved={() => {
                void reload();
              }}
            />,
          ];

          if (record.status === "pending_validation") {
            actions.push(
              <Button
                key="approve"
                label={t("admin.bookings.approve")}
                style="blue"
                onClick={() => approve(record.id)}
              />,
              <RejectBookingModal
                key="reject"
                bookingId={record.id}
                onRejected={() => {
                  void reload();
                }}
              />,
            );
          } else if (record.status === "awaiting_deposit") {
            actions.push(
              <Button
                key="deposit"
                label={t("admin.bookings.markDepositPaid")}
                style="blue"
                onClick={() => markDepositPaid(record.id)}
              />,
              <RejectBookingModal
                key="reject"
                bookingId={record.id}
                onRejected={() => {
                  void reload();
                }}
              />,
            );
          } else if (record.status === "confirmed") {
            actions.push(
              <Button
                key="completed"
                label={t("admin.bookings.markCompleted")}
                style="blue"
                onClick={() => markCompleted(record.id)}
              />,
              <RejectBookingModal
                key="reject"
                bookingId={record.id}
                onRejected={() => {
                  void reload();
                }}
              />,
            );
          }

          // Prevent the row click from firing when the user actions a button.
          return (
            <div
              style={{ display: "flex", gap: 8 }}
              onClick={(e) => e.stopPropagation()}
            >
              {actions}
            </div>
          );
        },
        mobile: { visible: true, order: 5, titleVisible: false },
      },
    ],
    [t, language],
  );

  return (
    <div className="artistDashboard">
      <SeoHead
        title={t("admin.bookings.title")}
        description=""
        path="/admin/bookings"
      />
      <header className="header">
        <h1>{t("admin.bookings.title")}</h1>
        <Button
          label={t("admin.bookings.manualCreate")}
          style="blue"
          onClick={() => navigate(getPagePath("adminBookingNew", language))}
        />
      </header>

      <Card className="panel">
        <StyledDropdown<StatusOption>
          label={t("admin.bookings.filterStatus")}
          value={statusFilter}
          setValue={setStatusFilter}
          itemList={statusOptions}
          itemIdKey="id"
          itemLabelKey="name"
          width="240px"
        />
      </Card>

      {total > bookings.length ? (
        <Card className="panel">
          <p className="listTruncationWarning" role="alert">
            {t("admin.list.truncationWarning", {
              shown: bookings.length,
              total,
            })}
          </p>
        </Card>
      ) : null}

      <Card className="panel">
        <DynamicTable
          data={bookings}
          columns={bookingColumns}
          pagined
          mobile
          tableId="admin-bookings"
          onClick={(record: AdminBookingRow) =>
            navigate(buildAdminBookingDetailPath(record.id, language))
          }
        />
      </Card>
    </div>
  );
};

export default AdminBookings;
