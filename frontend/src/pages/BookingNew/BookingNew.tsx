import "./BookingNew.scss";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import PublicAvailabilityCalendar from "@/components/PublicAvailabilityCalendar/PublicAvailabilityCalendar";
import SeoHead from "@/components/SeoHead/SeoHead";
import TierIndicator, {
  tierFromLevel,
} from "@/components/TierIndicator/TierIndicator";
import { getPagePath } from "@/config/pages";
import {
  Button,
  Card,
  StyledDropdown,
  StyledInputBase,
  StyledInputNumber,
  StyledInputText,
  StyledInputTextArea,
} from "@/covaltech-react-ui";
import { useLanguage } from "@/hooks/useLanguage";
import { useClientAuthStore } from "@/stores/ClientAuthStore";
import { formatPriceCents } from "@/Utils/formatPrice";
import {
  type ArtistDetailDto,
  fetchArtistBySlug,
  fetchArtists,
} from "@/Utils/Services/Public/artistsApi";
import { postCreateBooking } from "@/Utils/Services/Public/bookingApi";
import {
  ArtistSetType,
  postEstimate,
  type PricingBreakdown,
} from "@/Utils/Services/Public/pricingApi";

interface FormState {
  eventDate: string;
  durationHours: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  context: string;
  capacity: string;
  ticketPrice: string;
  setType: ArtistSetType;
  website: string;
}

const INITIAL_STATE: FormState = {
  eventDate: "",
  durationHours: "1",
  street: "",
  postalCode: "",
  city: "",
  country: "Belgique",
  context: "",
  capacity: "500",
  ticketPrice: "15",
  setType: ArtistSetType.DJ,
  website: "",
};

const MIN_CONTEXT_LEN = 0;
const MAX_CONTEXT_LEN = 2000;
const ESTIMATE_DEBOUNCE_MS = 400;
const DEFAULT_EVENT_TIME = "20:00";

const BookingNew = () => {
  const { t } = useTranslation();
  const language = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const artistSlug = searchParams.get("artist");
  const legacyArtistId = searchParams.get("artistId");
  const prefillDuration = searchParams.get("duration");
  const prefillDate = searchParams.get("date");
  const prefillLocation = searchParams.get("location");
  const prefillCapacity = searchParams.get("capacity");
  const prefillTicketPrice = searchParams.get("ticketPrice");
  const prefillSetType = searchParams.get("setType");

  const isValidSetType = (value: string | null): value is ArtistSetType =>
    value === "dj" || value === "hybrid" || value === "live";

  const clientToken = useClientAuthStore((s) => s.token);

  // The price simulator prefills `date` as `YYYY-MM-DD` (its input is
  // `type="date"`). Our event field is `type="datetime-local"`, which silently
  // discards values without a time — so the field would render empty and the
  // user would have to re-enter the date. Promote the date by adding the
  // default event time.
  const normalizedPrefillDate = prefillDate
    ? /^\d{4}-\d{2}-\d{2}$/.test(prefillDate)
      ? `${prefillDate}T${DEFAULT_EVENT_TIME}`
      : prefillDate
    : undefined;

  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL_STATE,
    durationHours: prefillDuration ?? INITIAL_STATE.durationHours,
    eventDate: normalizedPrefillDate ?? INITIAL_STATE.eventDate,
    street: prefillLocation ?? INITIAL_STATE.street,
    capacity: prefillCapacity ?? INITIAL_STATE.capacity,
    // querystring `ticketPrice` is in cents to keep the simulator in sync;
    // the form displays euros.
    ticketPrice: prefillTicketPrice
      ? String(Math.round(Number(prefillTicketPrice)) / 100)
      : INITIAL_STATE.ticketPrice,
    setType: isValidSetType(prefillSetType)
      ? prefillSetType
      : INITIAL_STATE.setType,
  }));

  const goToLogin = () => {
    const next = encodeURIComponent(location.pathname + location.search);
    navigate(`${getPagePath("accountLogin", language)}?next=${next}`);
  };

  const goToSignup = () => {
    const next = encodeURIComponent(location.pathname + location.search);
    navigate(`${getPagePath("accountSignup", language)}?next=${next}`);
  };
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [artist, setArtist] = useState<ArtistDetailDto | null>(null);
  const [artistLoading, setArtistLoading] = useState<boolean>(
    Boolean(artistSlug) || Boolean(legacyArtistId),
  );
  const [artistMissing, setArtistMissing] = useState(false);
  const [estimate, setEstimate] = useState<PricingBreakdown | null>(null);
  const [estimating, setEstimating] = useState(false);

  // Legacy URLs use ?artistId=<uuid>. Resolve the matching slug from the public
  // artist list and rewrite the URL to the canonical ?artist=<slug> so the rest
  // of the page (which fetches by slug) works.
  useEffect(() => {
    if (!legacyArtistId || artistSlug) return;
    let cancelled = false;
    setArtistLoading(true);
    fetchArtists({ pageSize: 200 }).then((res) => {
      if (cancelled) return;
      const matched = res?.data.find((a) => a.id === legacyArtistId);
      const next = new URLSearchParams(searchParams);
      next.delete("artistId");
      if (matched) {
        next.set("artist", matched.slug);
      } else {
        setArtistMissing(true);
        setArtistLoading(false);
      }
      setSearchParams(next, { replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [legacyArtistId, artistSlug, searchParams, setSearchParams]);

  useEffect(() => {
    if (!artistSlug) {
      if (!legacyArtistId) setArtistLoading(false);
      return;
    }
    let cancelled = false;
    setArtistLoading(true);
    setArtistMissing(false);
    fetchArtistBySlug(artistSlug, language)
      .then((res) => {
        if (cancelled) return;
        setArtist(res);
        setArtistMissing(!res);
      })
      .finally(() => {
        if (!cancelled) setArtistLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [artistSlug, legacyArtistId, language]);

  const desiredEventDateIso = useMemo(() => {
    if (!form.eventDate) return undefined;
    const parsed = new Date(form.eventDate);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }, [form.eventDate]);

  // /api/pricing/estimate validates `date` as a calendar date (YYYY-MM-DD).
  // datetime-local already gives us "YYYY-MM-DDTHH:mm" — slice off the time.
  const desiredEventDateOnly = useMemo(() => {
    if (!form.eventDate) return undefined;
    const datePart = form.eventDate.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : undefined;
  }, [form.eventDate]);

  const durationNumber = useMemo(() => {
    const n = Number(form.durationHours);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [form.durationHours]);

  // The backend stores the event location as a single string, so we recompose
  // the multi-part address fields into one line: "street, postalCode city, country".
  const eventAddress = useMemo(() => {
    const cityLine = [form.postalCode.trim(), form.city.trim()]
      .filter(Boolean)
      .join(" ");
    return [form.street.trim(), cityLine, form.country.trim()]
      .filter(Boolean)
      .join(", ");
  }, [form.street, form.postalCode, form.city, form.country]);

  const capacityNumber = useMemo(() => {
    const n = Number(form.capacity);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
  }, [form.capacity]);

  const ticketPriceCents = useMemo(() => {
    const n = Number(form.ticketPrice);
    return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
  }, [form.ticketPrice]);

  const supportedSetTypes: ArtistSetType[] = useMemo(() => {
    const fallback = [
      ArtistSetType.DJ,
      ArtistSetType.HYBRID,
      ArtistSetType.LIVE,
    ];
    if (!artist || !Array.isArray(artist.supportedSetTypes)) return fallback;
    return artist.supportedSetTypes.length > 0
      ? (artist.supportedSetTypes as ArtistSetType[])
      : fallback;
  }, [artist]);

  // If the artist doesn't perform the currently-selected setType, snap to the
  // first supported one so the form stays consistent.
  useEffect(() => {
    if (!supportedSetTypes.includes(form.setType)) {
      setForm((prev) => ({ ...prev, setType: supportedSetTypes[0] }));
    }
  }, [supportedSetTypes, form.setType]);

  // Live quote: debounce calls to /api/pricing/estimate whenever a pricing
  // input changes so the client sees a real-time total. Estimation requires
  // the resolved artist + valid capacity + ticket price + set type.
  useEffect(() => {
    if (
      !artist ||
      !desiredEventDateOnly ||
      !durationNumber ||
      capacityNumber === null ||
      ticketPriceCents === null
    ) {
      setEstimate(null);
      return;
    }
    setEstimating(true);
    const timer = setTimeout(async () => {
      const result = await postEstimate({
        artistId: artist.id,
        durationHours: durationNumber,
        date: desiredEventDateOnly,
        location: { address: eventAddress || undefined },
        capacity: capacityNumber,
        ticketPriceCents,
        setType: form.setType,
        options: [],
      });
      setEstimate(result);
      setEstimating(false);
    }, ESTIMATE_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      setEstimating(false);
    };
  }, [
    artist,
    desiredEventDateOnly,
    durationNumber,
    eventAddress,
    capacityNumber,
    ticketPriceCents,
    form.setType,
  ]);

  const validate = (state: FormState) => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!state.eventDate) {
      next.eventDate = t("bookingNew.errors.dateRequired");
    }
    if (!durationNumber) {
      next.durationHours = t("bookingNew.errors.durationRequired");
    }
    if (!state.street.trim()) {
      next.street = t("bookingNew.errors.streetRequired");
    }
    if (!state.postalCode.trim()) {
      next.postalCode = t("bookingNew.errors.postalCodeRequired");
    }
    if (!state.city.trim()) {
      next.city = t("bookingNew.errors.cityRequired");
    }
    if (!state.country.trim()) {
      next.country = t("bookingNew.errors.countryRequired");
    }
    if (
      state.context.trim().length > 0 &&
      state.context.trim().length < MIN_CONTEXT_LEN
    ) {
      next.context = t("bookingNew.errors.contextTooShort");
    }
    if (state.context.length > MAX_CONTEXT_LEN) {
      next.context = t("bookingNew.errors.contextTooLong");
    }
    return next;
  };

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCalendarDayClick = (isoDate: string) => {
    setForm((prev) => {
      const currentTime = prev.eventDate.includes("T")
        ? prev.eventDate.split("T")[1]
        : DEFAULT_EVENT_TIME;
      return { ...prev, eventDate: `${isoDate}T${currentTime}` };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistSlug) {
      toast.error(t("bookingNew.errors.artistRequired"));
      return;
    }
    if (form.website) {
      // honeypot — silently drop spam
      setSubmitted(true);
      return;
    }
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    if (!desiredEventDateIso || !durationNumber) return;

    if (capacityNumber === null || ticketPriceCents === null) {
      toast.error(t("bookingNew.errors.pricingRequired"));
      return;
    }

    setSubmitting(true);
    const res = await postCreateBooking({
      artistSlug,
      eventDate: desiredEventDateIso,
      durationHours: durationNumber,
      location: { address: eventAddress },
      context: form.context.trim() || undefined,
      capacity: capacityNumber,
      ticketPriceCents,
      setType: form.setType,
      options: [],
      locale: language,
    });
    setSubmitting(false);

    if (res) {
      toast.success(t("bookingNew.form.success"));
      setForm(INITIAL_STATE);
      setSubmitted(true);
      // The booking lands in `pending_validation`. An admin reaches out
      // off-platform to arrange the deposit/payment; there's no payment page
      // for the client to land on.
    }
  };

  const heroTitle = t("bookingNew.title");
  const heroSubtitle = t("bookingNew.subtitle");

  return (
    <div className="bookingNew">
      <SeoHead
        title={heroTitle}
        description={heroSubtitle}
        path="/booking/new"
      />
      <header className="header">
        <h1>{heroTitle}</h1>
        <p>{heroSubtitle}</p>
      </header>

      <div className="layout">
        <Card className="panel">
          {submitted ? null : artistSlug ? (
            artistLoading ? (
              <p>{t("common.loading")}</p>
            ) : artist ? (
              <div className="summary">
                <h2>{t("bookingNew.artist.title")}</h2>
                <dl>
                  <dt>{t("bookingNew.artist.name")}</dt>
                  <dd>{artist.stageName}</dd>
                  {artist.genre ? (
                    <>
                      <dt>{t("bookingNew.artist.genre")}</dt>
                      <dd>{artist.genre}</dd>
                    </>
                  ) : null}
                  <dt>{t("bookingNew.artist.tier")}</dt>
                  <dd>
                    <TierIndicator tier={tierFromLevel(artist.level)} />
                  </dd>
                </dl>
              </div>
            ) : artistMissing ? (
              <p className="disclaimer">{t("bookingNew.artist.notFound")}</p>
            ) : null
          ) : (
            <p className="disclaimer">{t("bookingNew.artist.missingId")}</p>
          )}

          {submitted ? (
            <div className="summary">
              <h2>{t("bookingNew.form.successTitle")}</h2>
              <p className="disclaimer">{t("bookingNew.form.successBody")}</p>
            </div>
          ) : !clientToken ? (
            <div className="authRequired">
              <h2>{t("bookingNew.authRequired.title")}</h2>
              <p className="disclaimer">
                {t("bookingNew.authRequired.description")}
              </p>
              <div className="actions">
                <Button
                  label={t("bookingNew.authRequired.signup")}
                  style="blue"
                  onClick={goToSignup}
                  width="100%"
                />
                <Button
                  label={t("bookingNew.authRequired.login")}
                  style="bordered"
                  onClick={goToLogin}
                  width="100%"
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                <div className="field">
                  <StyledInputBase
                    label={t("bookingNew.fields.date")}
                    value={form.eventDate}
                    setValue={(v: string) => handleChange("eventDate", v)}
                    type="datetime-local"
                    width="100%"
                  >
                    <input
                      type="datetime-local"
                      value={form.eventDate}
                      onChange={(e) =>
                        handleChange("eventDate", e.target.value)
                      }
                      required
                    />
                  </StyledInputBase>
                  {errors.eventDate ? <span>{errors.eventDate}</span> : null}
                </div>
                <div className="field">
                  <StyledInputNumber
                    label={t("bookingNew.fields.duration")}
                    value={form.durationHours}
                    setValue={(v) => handleChange("durationHours", v ?? "")}
                    min="0.5"
                    max="24"
                  />
                  {errors.durationHours ? (
                    <span>{errors.durationHours}</span>
                  ) : null}
                </div>
              </div>

              <div className="field">
                <StyledInputText
                  label={t("bookingNew.fields.street")}
                  value={form.street}
                  setValue={(v) => handleChange("street", v)}
                  required
                />
                {errors.street ? <span>{errors.street}</span> : null}
              </div>

              <div className="row">
                <div className="field">
                  <StyledInputText
                    label={t("bookingNew.fields.postalCode")}
                    value={form.postalCode}
                    setValue={(v) => handleChange("postalCode", v)}
                    required
                  />
                  {errors.postalCode ? <span>{errors.postalCode}</span> : null}
                </div>
                <div className="field">
                  <StyledInputText
                    label={t("bookingNew.fields.city")}
                    value={form.city}
                    setValue={(v) => handleChange("city", v)}
                    required
                  />
                  {errors.city ? <span>{errors.city}</span> : null}
                </div>
              </div>

              <div className="field">
                <StyledInputText
                  label={t("bookingNew.fields.country")}
                  value={form.country}
                  setValue={(v) => handleChange("country", v)}
                  required
                />
                {errors.country ? <span>{errors.country}</span> : null}
              </div>

              <div className="row">
                <div className="field">
                  <StyledInputNumber
                    label={t("bookingNew.fields.capacity")}
                    value={form.capacity}
                    setValue={(v) => handleChange("capacity", v ?? "")}
                    min="0"
                  />
                </div>
                <div className="field">
                  <StyledInputNumber
                    label={t("bookingNew.fields.ticketPrice")}
                    value={form.ticketPrice}
                    setValue={(v) => handleChange("ticketPrice", v ?? "")}
                    min="0"
                  />
                </div>
              </div>

              <div className="field">
                <StyledDropdown<{ id: ArtistSetType; name: string }>
                  label={t("bookingNew.fields.setType")}
                  value={
                    {
                      id: form.setType,
                      name: t(`bookingNew.fields.setType_${form.setType}`),
                    } as { id: ArtistSetType; name: string }
                  }
                  setValue={(opt) =>
                    setForm((prev) => ({
                      ...prev,
                      setType: opt?.id ?? supportedSetTypes[0],
                    }))
                  }
                  itemList={supportedSetTypes.map((id) => ({
                    id,
                    name: t(`bookingNew.fields.setType_${id}`),
                  }))}
                  itemIdKey="id"
                  itemLabelKey="name"
                  disabled={supportedSetTypes.length <= 1}
                  width="100%"
                />
              </div>

              <div className="field">
                <StyledInputTextArea
                  label={t("bookingNew.fields.context")}
                  value={form.context}
                  setValue={(v) => handleChange("context", v)}
                  style={{ minHeight: "120px" }}
                />
                {errors.context ? <span>{errors.context}</span> : null}
              </div>

              <div
                className="field"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: -9999,
                  height: 0,
                  width: 0,
                }}
              >
                <StyledInputText
                  label="Website"
                  value={form.website}
                  setValue={(v) => handleChange("website", v)}
                />
              </div>

              <p className="disclaimer">{t("bookingNew.disclaimer")}</p>

              <div className="actions">
                <Button
                  label={t("bookingNew.form.submit")}
                  type="submit"
                  style="blue"
                  isLoading={submitting}
                  disabled={!artistSlug || artistMissing}
                  width="100%"
                />
              </div>
            </form>
          )}
        </Card>

        {artist && !submitted ? (
          <aside className="sideColumn">
            <Card className="panel sidePanel">
              <h2>{t("bookingNew.calendarPreview.title")}</h2>
              <p className="sideHint">
                {t("bookingNew.calendarPreview.clickHint")}
              </p>
              <div className="miniCalendar">
                <PublicAvailabilityCalendar
                  artistId={artist.id}
                  monthsAhead={2}
                  onDayClick={handleCalendarDayClick}
                />
              </div>
            </Card>

            {estimate ? (
              <Card className="panel sidePanel summary">
                <h2>{t("bookingNew.quote.title")}</h2>
                <dl>
                  <dt>{t("bookingNew.quote.artistCost")}</dt>
                  <dd>
                    {formatPriceCents(estimate.artistCostCents, language)}
                  </dd>
                  <dt>{t("bookingNew.quote.travelCost")}</dt>
                  <dd>
                    {formatPriceCents(estimate.travelCostCents, language)}
                  </dd>
                  <dt>{t("bookingNew.quote.subtotal")}</dt>
                  <dd>{formatPriceCents(estimate.subtotalCents, language)}</dd>
                  <dt>{t("bookingNew.quote.vat")}</dt>
                  <dd>{formatPriceCents(estimate.vatCents, language)}</dd>
                  <dt>
                    <strong>{t("bookingNew.quote.total")}</strong>
                  </dt>
                  <dd>
                    <strong>
                      {formatPriceCents(estimate.totalCents, language)}
                    </strong>
                  </dd>
                </dl>
                <p className="disclaimer">{t("bookingNew.quote.disclaimer")}</p>
              </Card>
            ) : estimating ? (
              <Card className="panel sidePanel">
                <p className="disclaimer">{t("bookingNew.quote.computing")}</p>
              </Card>
            ) : null}
          </aside>
        ) : null}
      </div>
    </div>
  );
};

export default BookingNew;
