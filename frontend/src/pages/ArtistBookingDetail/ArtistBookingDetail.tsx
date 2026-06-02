import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaEnvelope,
  FaFileContract,
  FaHashtag,
  FaInfoCircle,
  FaLock,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

import BookingDetailLayout from "@/components/BookingDetailLayout/BookingDetailLayout";
import SeoHead from "@/components/SeoHead/SeoHead";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import { buildArtistBookingDetailUrl } from "@/config/apiRoutes";
import {
  BOOKING_STATUS_TONE,
  type BookingStatus,
  bookingStatusLabel,
  type BookingStatusTone,
} from "@/config/bookingStatusLabels";
import { getPagePath } from "@/config/pages";
import {
  Button,
  CopyButton,
  Identicon,
  NoData,
  Spinner,
} from "@/covaltech-react-ui";
import { useLanguage } from "@/hooks/useLanguage";
import { useArtistAuthStore } from "@/stores/ArtistAuthStore";
import { computeRemainingCents } from "@/Utils/booking";
import { formatEventDateTime } from "@/Utils/Date/date";
import { formatPriceCents } from "@/Utils/formatPrice";
import { loggerService, LogTag } from "@/Utils/LoggerService";
import { artistFetch } from "@/Utils/Services/Authenticated/artistFetch";

interface BookingDetailResponse {
  id: string;
  status: BookingStatus;
  eventDate: string;
  // The backend returns the NUMERIC duration as a string; keep it typed as such
  // and let i18n interpolation render it verbatim. (#59)
  eventDurationHours: string;
  eventLocation: string;
  eventContext: string | null;
  options: string[] | null;
  quotedTotalCents: number;
  depositAmountCents: number;
  client: { name: string; email: string; phone: string | null } | null;
  cancelReason: string | null;
}

const ArtistBookingDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const language = useLanguage();
  const token = useArtistAuthStore((s) => s.token);

  const [data, setData] = useState<BookingDetailResponse | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id || !token) return;
    let cancelled = false;
    // Use the artist-scoped wrapper so a 401 triggers a refresh-then-retry and a
    // definitive expiry clears the session (route guards then redirect). (#51)
    void artistFetch<BookingDetailResponse>(buildArtistBookingDetailUrl(id))
      .then((res) => {
        if (cancelled) return;
        if (!res) {
          setNotFound(true);
          return;
        }
        setData(res);
      })
      .catch((err) => {
        loggerService.error(
          LogTag.API,
          "ArtistBookingDetail: failed to load booking",
          err,
        );
        if (!cancelled) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  const tone: BookingStatusTone = useMemo(
    () => (data ? BOOKING_STATUS_TONE[data.status] : "neutral"),
    [data],
  );

  const statusLabel = useMemo(() => {
    if (!data) return "";
    return bookingStatusLabel(t, data.status);
  }, [data, t]);

  const remainingCents = useMemo(
    () =>
      data
        ? computeRemainingCents(data.quotedTotalCents, data.depositAmountCents)
        : 0,
    [data],
  );

  const goBack = () => {
    navigate(getPagePath("artistBookings", language));
  };

  return (
    <BookingDetailLayout>
      <SeoHead
        title={t("artistArea.bookingDetail.title")}
        description=""
        path={`/artist/bookings/${id}`}
      />

      <div className="backRow">
        <Button
          label={t("artistArea.bookingDetail.back")}
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
                  {t("artistArea.bookingDetail.eyebrow")}
                </span>
                <h1 className="heroTitle">
                  {t("artistArea.bookingDetail.heroTitle", {
                    date: formatEventDateTime(data.eventDate, language),
                  })}
                </h1>
                <div className="heroMeta">
                  <span>
                    <FaMapMarkerAlt /> {data.eventLocation}
                  </span>
                  <span>
                    <FaClock />{" "}
                    {t("artistArea.bookingDetail.durationValue", {
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

          <div className="grid">
            <div className="column">
              <article className="card">
                <header className="cardHeader">
                  <FaCalendarAlt />
                  <h2>{t("artistArea.bookingDetail.eventSection")}</h2>
                </header>
                <ul className="rowList">
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
                      {t("artistArea.bookingDetail.durationValue", {
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

                {data.options && data.options.length > 0 && (
                  <ul className="optionsList">
                    {data.options.map((option) => (
                      <li key={option}>{option}</li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="card">
                <header className="cardHeader">
                  <FaFileContract />
                  <h2>{t("artistArea.bookingDetail.pricingSection")}</h2>
                </header>
                <div className="priceGrid">
                  <div className="priceTile isAccent">
                    <span className="priceLabel">
                      {t("artistArea.bookingDetail.total")}
                    </span>
                    <span className="priceValue">
                      {formatPriceCents(data.quotedTotalCents, language)}
                    </span>
                  </div>
                  <div className="priceTile">
                    <span className="priceLabel">
                      {t("artistArea.bookingDetail.deposit")}
                    </span>
                    <span className="priceValue">
                      {formatPriceCents(data.depositAmountCents, language)}
                    </span>
                  </div>
                  <div className="priceTile">
                    <span className="priceLabel">
                      {t("artistArea.bookingDetail.remaining")}
                    </span>
                    <span className="priceValue">
                      {formatPriceCents(remainingCents, language)}
                    </span>
                  </div>
                </div>
              </article>

              {data.status === "cancelled" && data.cancelReason && (
                <div className="cancelBox">
                  <strong>{t("artistArea.bookingDetail.cancelReason")}</strong>
                  <p style={{ margin: "8px 0 0" }}>{data.cancelReason}</p>
                </div>
              )}
            </div>

            <div className="column">
              <article className="card">
                <header className="cardHeader">
                  <FaUser />
                  <h2>{t("artistArea.bookingDetail.clientSection")}</h2>
                </header>

                {data.client ? (
                  <>
                    <div className="clientHeader">
                      <Identicon
                        seed={data.client.email}
                        className="clientIdenticon"
                        size={8}
                        scale={6}
                      />
                      <div>
                        <h3 className="clientName">{data.client.name}</h3>
                        <span className="clientRole">
                          {t("artistArea.bookingDetail.clientLabel")}
                        </span>
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
                    </ul>
                  </>
                ) : (
                  <div className="clientHidden">
                    <FaLock />
                    <div>
                      <strong>
                        {t("artistArea.bookingDetail.clientHiddenTitle")}
                      </strong>
                      <p style={{ margin: "4px 0 0" }}>
                        {t("artistArea.bookingDetail.clientHidden")}
                      </p>
                    </div>
                  </div>
                )}
              </article>

              <article className="card">
                <header className="cardHeader">
                  <FaInfoCircle />
                  <h2>{t("artistArea.bookingDetail.statusSection")}</h2>
                </header>
                <ul className="rowList">
                  <li className="row">
                    <span className="rowLabel">
                      {t("artistArea.bookingDetail.status")}
                    </span>
                    <span className="rowValue">
                      <StatusBadge tone={tone}>{statusLabel}</StatusBadge>
                    </span>
                  </li>
                  <li className="row">
                    <span className="rowLabel">
                      {t("artistArea.bookingDetail.reference")}
                    </span>
                    <span className="rowValue isMuted">{data.id}</span>
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </>
      )}
    </BookingDetailLayout>
  );
};

export default ArtistBookingDetail;
