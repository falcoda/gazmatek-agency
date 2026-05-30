import "./ArtistGrid.scss";

import { useTranslation } from "react-i18next";

import { Button, NoData } from "@/covaltech-react-ui";
import type { AppLanguage } from "@/i18n/config";
import type { ArtistListResponse } from "@/Utils/Services/Public/artistsApi";

import ArtistCard from "../ArtistCard/ArtistCard";

interface ArtistGridProps {
  data: ArtistListResponse | null;
  loading: boolean;
  language: AppLanguage | undefined;
  onReset: () => void;
  onPageChange: (page: number) => void;
}

const ArtistGrid = ({
  data,
  loading,
  language,
  onReset,
  onPageChange,
}: ArtistGridProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <ul className="artistGrid isLoading" aria-busy="true">
        {Array.from({ length: 8 }).map((_, idx) => (
          <li key={idx} className="cardSkeleton" aria-hidden="true" />
        ))}
      </ul>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="artistGridEmpty">
        <h2>{t("artists.emptyTitle")}</h2>
        <p>{t("artists.emptyText")}</p>
        <NoData />
        <Button
          label={t("artists.filters.reset")}
          style="line"
          onClick={onReset}
        />
      </div>
    );
  }

  const { pagination } = data;
  const hasPrev = pagination.page > 1;
  const hasNext = pagination.page < pagination.totalPages;

  return (
    <div className="artistGridWrapper">
      <ul className="artistGrid">
        {data.data.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} language={language} />
        ))}
      </ul>

      {pagination.totalPages > 1 ? (
        <nav className="pagination" aria-label="pagination">
          <Button
            label="‹"
            style="line"
            disabled={!hasPrev}
            onClick={() => onPageChange(pagination.page - 1)}
          />
          <span>
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            label="›"
            style="line"
            disabled={!hasNext}
            onClick={() => onPageChange(pagination.page + 1)}
          />
        </nav>
      ) : null}
    </div>
  );
};

export default ArtistGrid;
