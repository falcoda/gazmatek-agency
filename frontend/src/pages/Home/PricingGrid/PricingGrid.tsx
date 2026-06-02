import "./PricingGrid.scss";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Bounded from "@/components/Bounded/Bounded";
import Section from "@/components/Section/Section";
import { getPagePath } from "@/config/pages";
import { Button } from "@/covaltech-react-ui";
import { useLanguage } from "@/hooks/useLanguage";
import { formatPriceCents } from "@/Utils/formatPrice";
import {
  fetchPricingGrid,
  type PricingGridDto,
} from "@/Utils/Services/Public/pricingApi";

const LEVELS = ["L1", "L2", "L3", "L4"] as const;

const formatPercent = (coef: number): string =>
  `+${Math.round((coef - 1) * 100)} %`;

const PricingGrid = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useLanguage();

  const [grid, setGrid] = useState<PricingGridDto | null>(null);
  const [selectedCapacity, setSelectedCapacity] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchPricingGrid().then((res) => {
      if (cancelled || !res) return;
      setGrid(res);
      if (res.examples.length > 0) {
        setSelectedCapacity(res.examples[0].capacity);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!grid) {
    return null;
  }

  const formatCents = (euros: number) =>
    formatPriceCents(euros * 100, language);

  const exampleRows =
    grid.examples.find((e) => e.capacity === selectedCapacity)?.rows ?? [];

  const isLarge = (capacity: number) => capacity >= grid.largeCapacityThreshold;

  return (
    <Section className="pricingGrid fi" data-section="pricingGrid">
      <Bounded width="medium" className="inner">
        <header className="header">
          <p className="eyebrow">{t("home.pricingGrid.eyebrow")}</p>
          <h2 className="title">{t("home.pricingGrid.title")}</h2>
          <p className="formula">
            <span className="formulaPart">
              {t("home.pricingGrid.formula.cachet")}
            </span>
            <span className="formulaOp">=</span>
            <span className="formulaPart isAccent">
              {t("home.pricingGrid.formula.multiplier")}
            </span>
            <span className="formulaOp">×</span>
            <span className="formulaPart isAccent">
              {t("home.pricingGrid.formula.ticket")}
            </span>
          </p>
          <p className="subtitle">{grid.principle}</p>
        </header>

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th className="corner">{t("home.pricingGrid.col.capacity")}</th>
                <th>{t("home.pricingGrid.col.bounds")}</th>
                {LEVELS.map((level) => (
                  <th key={level} className="levelCol">
                    <div className="levelChip">{level}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className="capacityCell">
                  &lt; {grid.largeCapacityThreshold.toLocaleString(language)}
                </th>
                <td className="boundsCell">
                  ×{grid.bounds.small.floor} – ×{grid.bounds.small.cap}
                </td>
                {LEVELS.map((level) => (
                  <td key={level} className="valueCell">
                    ×{grid.multipliers.small[level]}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="capacityCell">
                  ≥ {grid.largeCapacityThreshold.toLocaleString(language)}
                </th>
                <td className="boundsCell">
                  ×{grid.bounds.large.floor} – ×{grid.bounds.large.cap}
                </td>
                {LEVELS.map((level) => (
                  <td key={level} className="valueCell">
                    ×{grid.multipliers.large[level]}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <ul className="uplifts">
          <li>
            <span className="upliftTag isHybrid">Hybrid</span>
            <span className="upliftValue">
              {formatPercent(grid.setTypeUplift.hybrid)}
            </span>
          </li>
          <li>
            <span className="upliftTag isLive">Live</span>
            <span className="upliftValue">
              {formatPercent(grid.setTypeUplift.live)}
            </span>
          </li>
        </ul>

        {grid.examples.length > 0 ? (
          <div className="examples">
            <div className="examplesHeader">
              <h3 className="examplesTitle">
                {t("home.pricingGrid.examples.title")}
              </h3>
              <div className="capacityTabs" role="tablist">
                {grid.examples.map((ex) => (
                  <button
                    key={ex.capacity}
                    type="button"
                    role="tab"
                    aria-selected={selectedCapacity === ex.capacity}
                    className={`capacityTab ${
                      selectedCapacity === ex.capacity ? "isActive" : ""
                    }`}
                    onClick={() => setSelectedCapacity(ex.capacity)}
                  >
                    {ex.capacity.toLocaleString(language)}
                    <span className="capacityTabBadge">
                      {isLarge(ex.capacity)
                        ? `×${grid.bounds.large.floor}–×${grid.bounds.large.cap}`
                        : `×${grid.bounds.small.floor}–×${grid.bounds.small.cap}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="tableWrap">
              <table className="table isExamples">
                <thead>
                  <tr>
                    <th>{t("home.pricingGrid.examples.col.ticket")}</th>
                    <th>{t("home.pricingGrid.examples.col.gross")}</th>
                    {LEVELS.map((level) => (
                      <th key={level} className="levelCol">
                        <div className="levelChip">{level}</div>
                      </th>
                    ))}
                    <th>{t("home.pricingGrid.examples.col.floor")}</th>
                    <th>{t("home.pricingGrid.examples.col.cap")}</th>
                  </tr>
                </thead>
                <tbody>
                  {exampleRows.map((row) => (
                    <tr key={row.ticketPrice}>
                      <th scope="row" className="capacityCell">
                        {formatCents(row.ticketPrice)}
                      </th>
                      <td className="boundsCell">
                        {formatCents(row.grossRevenue)}
                      </td>
                      {LEVELS.map((level) => (
                        <td key={level} className="valueCell">
                          {formatCents(row.levels[level])}
                        </td>
                      ))}
                      <td className="valueCell">{formatCents(row.floor)}</td>
                      <td className="valueCell">{formatCents(row.cap)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="cta">
          <Button
            label={t("home.pricingGrid.cta")}
            style="blue"
            onClick={() => navigate(getPagePath("pricing", language))}
          />
        </div>
      </Bounded>
    </Section>
  );
};

export default PricingGrid;
