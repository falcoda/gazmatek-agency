import "./PriceSimulator.scss";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import PublicAvailabilityCalendar from "@/components/PublicAvailabilityCalendar/PublicAvailabilityCalendar";
import { buildBookingUrl } from "@/config/pages";
import {
  Button,
  Card,
  StyledDropdown,
  StyledInputBase,
  StyledInputNumber,
  StyledInputText,
} from "@/covaltech-react-ui";
import type { AppLanguage } from "@/i18n/config";
import { formatPercent, formatPriceCents } from "@/Utils/formatPrice";
import type { ArtistSummaryDto } from "@/Utils/Services/Public/artistsApi";
import {
  type ArtistFeeResult,
  ArtistLevel,
  ArtistSetType,
  postArtistFee,
  postEstimate,
  type PricingBreakdown,
} from "@/Utils/Services/Public/pricingApi";

interface PriceSimulatorProps {
  artists: ArtistSummaryDto[];
  loading: boolean;
  language: AppLanguage | undefined;
  presetArtistId?: string;
  /** Optional notification when the user picks a different artist. */
  onArtistChange?: (artistId: string | undefined) => void;
}

interface SimulatorFormState {
  artistId: string;
  durationHours: string;
  date: string;
  address: string;
  capacity: string;
  ticketPrice: string;
  setType: ArtistSetType;
}

interface ArtistOption {
  id: string;
  name: string;
}

interface SetTypeOption {
  id: ArtistSetType;
  name: string;
}

const DEFAULT_LEVEL: ArtistLevel = ArtistLevel.L2;

const INITIAL_STATE: SimulatorFormState = {
  artistId: "",
  durationHours: "1",
  date: "",
  address: "",
  capacity: "500",
  ticketPrice: "15",
  setType: ArtistSetType.DJ,
};

const PriceSimulator = ({
  artists,
  loading,
  language,
  presetArtistId,
  onArtistChange,
}: PriceSimulatorProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState<SimulatorFormState>(INITIAL_STATE);
  const [breakdown, setBreakdown] = useState<PricingBreakdown | null>(null);
  const [artistFee, setArtistFee] = useState<ArtistFeeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (presetArtistId) {
      setForm((prev) => ({ ...prev, artistId: presetArtistId }));
    } else if (artists.length > 0 && !form.artistId) {
      setForm((prev) => ({ ...prev, artistId: artists[0].id }));
    }
  }, [presetArtistId, artists, form.artistId]);

  const updateField = <K extends keyof SimulatorFormState>(
    key: K,
    value: SimulatorFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const artistOptions: ArtistOption[] = useMemo(
    () => [
      { id: "", name: t("pricing.form.selectArtist") },
      ...artists.map((artist) => ({ id: artist.id, name: artist.stageName })),
    ],
    [artists, t],
  );

  const selectedArtist =
    artistOptions.find((option) => option.id === form.artistId) ??
    artistOptions[0];

  const selectedArtistLevel: ArtistLevel = useMemo(() => {
    const artist = artists.find((a) => a.id === form.artistId);
    return artist?.level ?? DEFAULT_LEVEL;
  }, [artists, form.artistId]);

  const supportedSetTypes: ArtistSetType[] = useMemo(() => {
    const artist = artists.find((a) => a.id === form.artistId);
    const fallback = [
      ArtistSetType.DJ,
      ArtistSetType.HYBRID,
      ArtistSetType.LIVE,
    ];
    if (!artist || !Array.isArray(artist.supportedSetTypes)) {
      return fallback;
    }
    return artist.supportedSetTypes.length > 0
      ? artist.supportedSetTypes
      : fallback;
  }, [artists, form.artistId]);

  const setTypeOptions: SetTypeOption[] = useMemo(() => {
    const labelMap: Record<ArtistSetType, string> = {
      [ArtistSetType.DJ]: t("pricing.form.setTypeDj"),
      [ArtistSetType.HYBRID]: t("pricing.form.setTypeHybrid"),
      [ArtistSetType.LIVE]: t("pricing.form.setTypeLive"),
    };
    return supportedSetTypes.map((id) => ({ id, name: labelMap[id] }));
  }, [supportedSetTypes, t]);

  useEffect(() => {
    if (setTypeOptions.length === 0) return;
    if (!setTypeOptions.some((option) => option.id === form.setType)) {
      setForm((prev) => ({ ...prev, setType: setTypeOptions[0].id }));
    }
  }, [setTypeOptions, form.setType]);

  const selectedSetType =
    setTypeOptions.find((option) => option.id === form.setType) ??
    setTypeOptions[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.artistId || !form.durationHours || !form.date) {
      setFormError(t("pricing.errors.missingFields"));
      return;
    }

    const duration = Number(form.durationHours);
    if (!Number.isFinite(duration) || duration <= 0) {
      setFormError(t("pricing.errors.missingFields"));
      return;
    }

    setSubmitting(true);

    const capacity = Number(form.capacity) || 0;
    const ticketPriceEuros = Number(form.ticketPrice) || 0;

    const estimatePromise = postEstimate({
      artistId: form.artistId,
      durationHours: duration,
      date: form.date,
      location: { address: form.address || undefined },
      capacity,
      ticketPriceCents: Math.round(ticketPriceEuros * 100),
      setType: form.setType,
      options: [],
    });

    const feePromise = postArtistFee({
      capacity,
      ticketPrice: ticketPriceEuros,
      level: selectedArtistLevel,
      setType: form.setType,
    });

    const [estimateResult, feeResult] = await Promise.all([
      estimatePromise,
      feePromise,
    ]);

    setBreakdown(estimateResult);
    setArtistFee(feeResult);
    setSubmitting(false);
  };

  const selectedArtistSlug = useMemo(
    () => artists.find((a) => a.id === form.artistId)?.slug,
    [artists, form.artistId],
  );

  const bookingUrl = buildBookingUrl(
    {
      artistSlug: selectedArtistSlug,
      durationHours: Number(form.durationHours) || undefined,
      date: form.date || undefined,
      location: form.address || undefined,
      capacity: Number(form.capacity) || undefined,
      ticketPriceCents: form.ticketPrice
        ? Math.round(Number(form.ticketPrice) * 100)
        : undefined,
      setType: form.setType,
    },
    language,
  );

  const handleCalendarDayClick = (isoDate: string) => {
    updateField("date", isoDate);
  };

  return (
    <section className="priceSimulator" aria-label={t("pricing.title")}>
      <div className="layout">
        <div className="formColumn">
          <form className="form" onSubmit={handleSubmit} noValidate>
            <StyledDropdown<ArtistOption>
              label={t("pricing.form.artist")}
              value={selectedArtist}
              setValue={(option) => {
                const nextId = option?.id ?? "";
                updateField("artistId", nextId);
                onArtistChange?.(nextId || undefined);
              }}
              itemList={artistOptions}
              itemIdKey="id"
              itemLabelKey="name"
              disabled={loading}
              width="100%"
            />

            <div className="row">
              <StyledInputNumber
                label={t("pricing.form.duration")}
                value={form.durationHours}
                setValue={(v) => updateField("durationHours", v ?? "")}
                min="0.5"
                max="24"
              />
              <StyledInputBase
                label={t("pricing.form.date")}
                value={form.date}
                setValue={(v: string) => updateField("date", v)}
                type="date"
                htmlFor="priceSimulatorDate"
                width="100%"
              >
                <input
                  id="priceSimulatorDate"
                  type="date"
                  value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  required
                />
              </StyledInputBase>
            </div>

            <StyledInputText
              label={t("pricing.form.location")}
              value={form.address}
              setValue={(v) => updateField("address", v)}
              placeholder="1000 Bruxelles"
            />

            <div className="ticketed">
              <StyledInputNumber
                label={t("pricing.form.capacity")}
                value={form.capacity}
                setValue={(v) => updateField("capacity", v ?? "")}
                min="0"
              />
              <StyledInputNumber
                label={t("pricing.form.ticketPrice")}
                value={form.ticketPrice}
                setValue={(v) => updateField("ticketPrice", v ?? "")}
                min="0"
              />
              <div className="levelReadOnly" aria-live="polite">
                <span className="levelLabel">{t("pricing.form.level")}</span>
                <span className="levelValue">{selectedArtistLevel}</span>
              </div>
              <StyledDropdown<SetTypeOption>
                label={t("pricing.form.setType")}
                value={selectedSetType}
                setValue={(option) =>
                  updateField(
                    "setType",
                    option?.id ?? supportedSetTypes[0] ?? ArtistSetType.DJ,
                  )
                }
                itemList={setTypeOptions}
                itemIdKey="id"
                itemLabelKey="name"
                disabled={setTypeOptions.length <= 1}
                width="100%"
              />
            </div>

            {formError ? (
              <p className="error" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="formActions">
              <Button
                type="submit"
                label={t("pricing.form.estimate")}
                style="blue"
                isLoading={submitting}
                width="100%"
              />
              <Button
                type="button"
                label={t("pricing.form.bookNow")}
                style="white"
                onClick={() => navigate(bookingUrl)}
                width="100%"
              />
            </div>
          </form>

          {breakdown ? (
            <Card className="result">
              <h2 className="resultTitle">{t("pricing.result.title")}</h2>

              <dl className="breakdown">
                <div>
                  <dt>{t("pricing.result.artistCost")}</dt>
                  <dd>
                    {formatPriceCents(
                      breakdown.artistCostCents,
                      language ?? "fr",
                    )}
                  </dd>
                </div>
                <div>
                  <dt>{t("pricing.result.travelCost")}</dt>
                  <dd>
                    {formatPriceCents(
                      breakdown.travelCostCents,
                      language ?? "fr",
                    )}
                  </dd>
                </div>
                <div>
                  <dt>{t("pricing.result.optionsCost")}</dt>
                  <dd>
                    {formatPriceCents(
                      breakdown.optionsCostCents,
                      language ?? "fr",
                    )}
                  </dd>
                </div>
                <div className="subtotal">
                  <dt>{t("pricing.result.subtotal")}</dt>
                  <dd>
                    {formatPriceCents(
                      breakdown.subtotalCents,
                      language ?? "fr",
                    )}
                  </dd>
                </div>
                <div>
                  <dt>{t("pricing.result.vat")}</dt>
                  <dd>
                    {formatPriceCents(breakdown.vatCents, language ?? "fr")}
                  </dd>
                </div>
                <div className="total">
                  <dt>{t("pricing.result.total")}</dt>
                  <dd>
                    {formatPriceCents(breakdown.totalCents, language ?? "fr")}
                  </dd>
                </div>
              </dl>

              {artistFee ? (
                <div className="artistFee">
                  <h3>{t("pricing.result.artistFeeTitle")}</h3>
                  <p>
                    <strong>
                      {t("pricing.result.artistFeeRecommended")} :
                    </strong>{" "}
                    {formatPriceCents(
                      Math.round(artistFee.recommended * 100),
                      language ?? "fr",
                    )}
                  </p>
                  <p>
                    <strong>{t("pricing.result.artistFeeRange")} :</strong>{" "}
                    {formatPriceCents(
                      Math.round(artistFee.range[0] * 100),
                      language ?? "fr",
                    )}{" "}
                    –{" "}
                    {formatPriceCents(
                      Math.round(artistFee.range[1] * 100),
                      language ?? "fr",
                    )}
                  </p>
                  <p>
                    {t("pricing.result.artistFeeGrossShare", {
                      percent: formatPercent(
                        artistFee.pctGross,
                        language ?? "fr",
                      ),
                    })}
                  </p>
                </div>
              ) : null}

              <p className="disclaimer">{t("pricing.result.disclaimer")}</p>

              <Button
                label={t("pricing.result.bookCta")}
                style="blue"
                onClick={() => navigate(bookingUrl)}
              />
            </Card>
          ) : null}
        </div>

        {form.artistId ? (
          <aside className="sideColumn">
            <Card className="panel sidePanel">
              <h2>{t("pricing.calendarPreview.title")}</h2>
              <p className="sideHint">
                {t("pricing.calendarPreview.clickHint")}
              </p>
              <div className="miniCalendar">
                <PublicAvailabilityCalendar
                  artistId={form.artistId}
                  monthsAhead={2}
                  onDayClick={handleCalendarDayClick}
                />
              </div>
            </Card>
          </aside>
        ) : null}
      </div>
    </section>
  );
};

export default PriceSimulator;
