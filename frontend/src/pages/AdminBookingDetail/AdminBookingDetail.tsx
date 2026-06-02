import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaEnvelope,
  FaFileContract,
  FaGlobe,
  FaHashtag,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

import BookingDetailLayout from "@/components/BookingDetailLayout/BookingDetailLayout";
import RejectBookingModal from "@/components/RejectBookingModal/RejectBookingModal";
import SeoHead from "@/components/SeoHead/SeoHead";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import {
  BOOKING_STATUS_TONE,
  type BookingStatus,
  bookingStatusLabel,
  type BookingStatusTone,
} from "@/config/bookingStatusLabels";
import { getPagePath } from "@/config/pages";
import {
  Button,
  Card,
  CopyButton,
  Identicon,
  NoData,
  Spinner,
} from "@/covaltech-react-ui";
import { useLanguage } from "@/hooks/useLanguage";
import { useAdminAuthStore } from "@/stores/AdminAuthStore";
import { computeRemainingCents } from "@/Utils/booking";
import { formatEventDateTime, formatTimestamp } from "@/Utils/Date/date";
import { formatPriceCents } from "@/Utils/formatPrice";
import { loggerService, LogTag } from "@/Utils/LoggerService";
import {
  type AdminBookingDetail as AdminBookingDetailDto,
  approveAdminBooking,
  fetchAdminBookingDetail,
  inviteClientAccount,
  markAdminBookingCompleted,
  markAdminBookingDepositPaid,
} from "@/Utils/Services/Authenticated/adminAreaApi";

const AdminBookingDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const language = useLanguage();
  const token = useAdminAuthStore((s) => s.token);

  const [data, setData] = useState<AdminBookingDetailDto | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [acting, setActing] = useState(false);
  const [inviting, setInviting] = useState(false);

  const handleInviteClient = async () => {
    if (!data?.client.accountId) return;
    setInviting(true);
    const res = await inviteClientAccount(
      data.client.accountId,
      language as "fr" | "nl" | "en",
    );
    setInviting(false);
    if (res) {
      toast.success(t("admin.bookings.detail.inviteSent"));
      reload();
    }
  };

  const reload = useCallback(async () => {
    if (!id || !token) return;
    const res = await fetchAdminBookingDetail(id).catch((err) => {
      loggerService.error(
        LogTag.API,
        "AdminBookingDetail: failed to load booking",
        err,
      );
      return null;
    });
    if (!res) {
      setNotFound(true);
      return;
    }
    setData(res);
  }, [id, token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const status = data?.status as BookingStatus | undefined;
  const tone: BookingStatusTone = useMemo(
    () => (status ? BOOKING_STATUS_TONE[status] : "neutral"),
    [status],
  );
  const statusLabel = useMemo(
    () => (status ? bookingStatusLabel(t, status) : ""),
    [status, t],
  );
  const remainingCents = useMemo(
    () =>
      data
        ? computeRemainingCents(data.quotedTotalCents, data.depositAmountCents)
        : 0,
    [data],
  );

  const optionLabels = useMemo<string[]>(() => {
    if (!data?.options) return [];
    if (!Array.isArray(data.options)) return [];
    return data.options
      .map((o) => {
        if (typeof o === "string") return o;
        if (o && typeof o === "object" && "label" in o) {
          const label = (o as { label?: unknown }).label;
          if (typeof label === "string") return label;
        }
        return null;
      })
      .filter((v): v is string => v !== null);
  }, [data]);

  const goBack = () => {
    navigate(getPagePath("adminBookings", language));
  };

  const handleApprove = async () => {
    if (!id || acting) return;
    setActing(true);
    const res = await approveAdminBooking(id);
    if (res) toast.success(t("admin.bookings.approved"));
    await reload();
    setActing(false);
  };

  const handleMarkDepositPaid = async () => {
    if (!id || acting) return;
    if (!window.confirm(t("admin.bookings.markDepositPaidConfirm"))) return;
    setActing(true);
    const res = await markAdminBookingDepositPaid(id);
    if (res) toast.success(t("admin.bookings.markDepositPaidSuccess"));
    await reload();
    setActing(false);
  };

  const handleMarkCompleted = async () => {
    if (!id || acting) return;
    if (!window.confirm(t("admin.bookings.markCompletedConfirm"))) return;
    setActing(true);
    const res = await markAdminBookingCompleted(id);
    if (res) toast.success(t("admin.bookings.markCompletedSuccess"));
    await reload();
    setActing(false);
  };

  return (
    <BookingDetailLayout>
      <SeoHead
        title={t("admin.bookings.detail.title")}
        description=""
        path={`/admin/bookings/${id}`}
      />

      <div className="backRow">
        <Button
          label={t("admin.bookings.detail.back")}
          icon={<FaArrowLeft />}
          style="bordered"
          onClick={goBack}
        />
      </div>

      {!data && !notFound && (
        <div className="loading">
          <Spinner />
          <span>{t("common.loading")}</span>
        </div>
      )}

      {notFound && <NoData />}

      {data && (
        <>
          <section className="hero">
            <div className="heroInner">
              <div className="heroLeft">
                <span className="eyebrow">
                  <FaFileContract />
                  {t("admin.bookings.detail.eyebrow")}
                </span>
                <h1 className="heroTitle">
                  {t("admin.bookings.detail.heroTitle", {
                    artist: data.artistStageName,
                  })}
                </h1>
                <div className="heroMeta">
                  <span>
                    <FaCalendarAlt />{" "}
                    {formatEventDateTime(data.eventDate, language)}
                  </span>
                  <span>
                    <FaMapMarkerAlt /> {data.eventLocation}
                  </span>
                  <span>
                    <FaClock />{" "}
                    {t("admin.bookings.detail.durationValue", {
                      hours: data.eventDurationHours,
                    })}
                  </span>
                </div>
              </div>

              <div className="heroRight">
                <StatusBadge tone={tone}>{statusLabel}</StatusBadge>
                <span className="idChip">
                  <FaHashtag />
                  {data.id.slice(0, 8)}
                  <CopyButton message={data.id} />
                </span>
              </div>
            </div>
          </section>

          <div className="cardsGrid">
            <Card>
              <header className="cardHeader">
                <FaUser />
                <h2>{t("admin.bookings.detail.clientSection")}</h2>
              </header>
              <div className="clientHeader">
                <Identicon
                  seed={data.client.email ?? data.client.accountId ?? data.id}
                  className="clientIdenticon"
                  size={8}
                  scale={6}
                />
                <div>
                  <h3 className="clientName">{data.client.name}</h3>
                  <span className="clientRole">{data.client.locale}</span>
                </div>
              </div>
              <ul className="rowList">
                <li className="row">
                  <span className="rowLabel">
                    <FaEnvelope />
                    {t("booking.fields.clientEmail")}
                  </span>
                  <span className="rowValue">
                    <a
                      href={`mailto:${data.client.email}`}
                      className="contactLink"
                    >
                      {data.client.email}
                    </a>
                  </span>
                </li>
                {data.client.phone && (
                  <li className="row">
                    <span className="rowLabel">
                      <FaPhone />
                      {t("booking.fields.clientPhone")}
                    </span>
                    <span className="rowValue">
                      <a
                        href={`tel:${data.client.phone}`}
                        className="contactLink"
                      >
                        {data.client.phone}
                      </a>
                    </span>
                  </li>
                )}
                <li className="row">
                  <span className="rowLabel">
                    <FaGlobe />
                    {t("admin.bookings.detail.locale")}
                  </span>
                  <span className="rowValue">
                    {data.client.locale.toUpperCase()}
                  </span>
                </li>
              </ul>
              {data.client.accountId &&
                !data.client.claimedAt &&
                data.client.accountEmail && (
                  <div className="clientInviteBlock">
                    <p className="clientInviteHint">
                      {t("admin.bookings.detail.inviteHint")}
                    </p>
                    <Button
                      label={t("admin.bookings.detail.inviteButton")}
                      style="bordered"
                      onClick={handleInviteClient}
                      isLoading={inviting}
                    />
                  </div>
                )}
              {data.client.claimedAt && (
                <p className="clientInviteHint">
                  {t("admin.bookings.detail.alreadyClaimed")}
                </p>
              )}
            </Card>

            <Card>
              <header className="cardHeader">
                <FaInfoCircle />
                <h2>{t("admin.bookings.detail.statusSection")}</h2>
              </header>
              <ul className="rowList">
                <li className="row">
                  <span className="rowLabel">
                    {t("admin.bookings.detail.status")}
                  </span>
                  <span className="rowValue">
                    <StatusBadge tone={tone}>{statusLabel}</StatusBadge>
                  </span>
                </li>
                <li className="row">
                  <span className="rowLabel">
                    {t("admin.bookings.detail.submittedAt")}
                  </span>
                  <span className="rowValue">
                    {formatTimestamp(data.createdAt, language)}
                  </span>
                </li>
                {data.adminApprovedAt && (
                  <li className="row">
                    <span className="rowLabel">
                      {t("admin.bookings.detail.approvedAt")}
                    </span>
                    <span className="rowValue">
                      {formatTimestamp(data.adminApprovedAt, language)}
                    </span>
                  </li>
                )}
                {data.paidAt && (
                  <li className="row">
                    <span className="rowLabel">
                      {t("admin.bookings.detail.paidAt")}
                    </span>
                    <span className="rowValue">
                      {formatTimestamp(data.paidAt, language)}
                    </span>
                  </li>
                )}
                <li className="row">
                  <span className="rowLabel">
                    {t("admin.bookings.detail.reference")}
                  </span>
                  <span className="rowValue isMuted">{data.id}</span>
                </li>
              </ul>
            </Card>

            <Card>
              <header className="cardHeader">
                <FaCalendarAlt />
                <h2>{t("admin.bookings.detail.eventSection")}</h2>
              </header>
              <ul className="rowList">
                <li className="row">
                  <span className="rowLabel">
                    {t("admin.bookings.detail.artist")}
                  </span>
                  <span className="rowValue">{data.artistStageName}</span>
                </li>
                <li className="row">
                  <span className="rowLabel">
                    <FaCalendarAlt />
                    {t("booking.fields.date")}
                  </span>
                  <span className="rowValue">
                    {formatEventDateTime(data.eventDate, language)}
                  </span>
                </li>
                <li className="row">
                  <span className="rowLabel">
                    <FaClock />
                    {t("booking.fields.duration")}
                  </span>
                  <span className="rowValue">
                    {t("admin.bookings.detail.durationValue", {
                      hours: data.eventDurationHours,
                    })}
                  </span>
                </li>
                <li className="row">
                  <span className="rowLabel">
                    <FaMapMarkerAlt />
                    {t("booking.fields.location")}
                  </span>
                  <span className="rowValue">{data.eventLocation}</span>
                </li>
              </ul>

              {data.eventContext && (
                <div className="contextBox">{data.eventContext}</div>
              )}

              {optionLabels.length > 0 && (
                <ul className="optionsList">
                  {optionLabels.map((option) => (
                    <li key={option}>{option}</li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <header className="cardHeader">
                <FaCheck />
                <h2>{t("admin.bookings.detail.actionsSection")}</h2>
              </header>
              <div className="actions">
                {data.status === "pending_validation" && (
                  <>
                    <Button
                      label={t("admin.bookings.approve")}
                      icon={<FaCheck />}
                      style="blue"
                      onClick={handleApprove}
                      isLoading={acting}
                    />
                    <RejectBookingModal
                      bookingId={id ?? ""}
                      onRejected={() => {
                        void reload();
                      }}
                      triggerIcon={<FaTimes />}
                    />
                  </>
                )}
                {data.status === "awaiting_deposit" && (
                  <>
                    <Button
                      label={t("admin.bookings.markDepositPaid")}
                      style="blue"
                      onClick={handleMarkDepositPaid}
                      isLoading={acting}
                    />
                    <RejectBookingModal
                      bookingId={id ?? ""}
                      onRejected={() => {
                        void reload();
                      }}
                      triggerIcon={<FaTimes />}
                    />
                  </>
                )}
                {data.status === "confirmed" && (
                  <>
                    <Button
                      label={t("admin.bookings.markCompleted")}
                      style="blue"
                      onClick={handleMarkCompleted}
                      isLoading={acting}
                    />
                    <RejectBookingModal
                      bookingId={id ?? ""}
                      onRejected={() => {
                        void reload();
                      }}
                      triggerIcon={<FaTimes />}
                    />
                  </>
                )}
                {(data.status === "completed" ||
                  data.status === "cancelled") && (
                  <p className="rowValue isMuted">
                    {t("admin.bookings.detail.noActions")}
                  </p>
                )}
              </div>
            </Card>

            <Card className="spanFull">
              <header className="cardHeader">
                <FaFileContract />
                <h2>{t("admin.bookings.detail.pricingSection")}</h2>
              </header>
              <div className="priceGrid">
                <div className="priceTile isAccent">
                  <span className="priceLabel">
                    {t("admin.bookings.detail.total")}
                  </span>
                  <span className="priceValue">
                    {formatPriceCents(data.quotedTotalCents, language)}
                  </span>
                </div>
                <div className="priceTile">
                  <span className="priceLabel">
                    {t("admin.bookings.detail.deposit")}
                  </span>
                  <span className="priceValue">
                    {formatPriceCents(data.depositAmountCents, language)}
                  </span>
                </div>
                <div className="priceTile">
                  <span className="priceLabel">
                    {t("admin.bookings.detail.remaining")}
                  </span>
                  <span className="priceValue">
                    {formatPriceCents(remainingCents, language)}
                  </span>
                </div>
              </div>
            </Card>

            {data.status === "cancelled" && data.cancelReason && (
              <div className="cancelBox spanFull">
                <strong>{t("admin.bookings.detail.cancelReason")}</strong>
                <p style={{ margin: "8px 0 0" }}>{data.cancelReason}</p>
              </div>
            )}
          </div>
        </>
      )}
    </BookingDetailLayout>
  );
};

export default AdminBookingDetail;
