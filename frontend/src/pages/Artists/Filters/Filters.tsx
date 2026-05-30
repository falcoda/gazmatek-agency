import "./Filters.scss";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, StyledDropdown, StyledInputBase } from "@/covaltech-react-ui";

export interface ArtistsFiltersState {
  genre: string;
  date: string;
}

interface FiltersProps {
  value: ArtistsFiltersState;
  onChange: (value: ArtistsFiltersState) => void;
  onReset: () => void;
}

interface GenreOption {
  id: string;
  name: string;
}

const GENRES = ["dj", "live", "hybrid", "animation"] as const;

const Filters = ({ value, onChange, onReset }: FiltersProps) => {
  const { t } = useTranslation();
  const [local, setLocal] = useState<ArtistsFiltersState>(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const genreOptions: GenreOption[] = useMemo(
    () => [
      { id: "", name: t("artists.filters.anyGenre") },
      ...GENRES.map((genre) => ({ id: genre, name: genre.toUpperCase() })),
    ],
    [t],
  );

  const selectedGenre =
    genreOptions.find((option) => option.id === local.genre) ?? genreOptions[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(local);
  };

  return (
    <form
      className="artistFilters"
      onSubmit={handleSubmit}
      role="search"
      aria-label={t("artists.filters.title")}
    >
      <div className="row">
        <StyledDropdown<GenreOption>
          label={t("artists.filters.genre")}
          value={selectedGenre}
          setValue={(option) =>
            setLocal((prev) => ({ ...prev, genre: option?.id ?? "" }))
          }
          itemList={genreOptions}
          itemIdKey="id"
          itemLabelKey="name"
          width="100%"
        />

        <StyledInputBase
          label={t("artists.filters.date")}
          value={local.date}
          setValue={(date: string) => setLocal((prev) => ({ ...prev, date }))}
          type="date"
          htmlFor="artistFiltersDate"
          width="100%"
        >
          <input
            id="artistFiltersDate"
            type="date"
            value={local.date}
            onChange={(e) =>
              setLocal((prev) => ({ ...prev, date: e.target.value }))
            }
          />
        </StyledInputBase>
      </div>

      <div className="actions">
        <Button type="submit" label={t("artists.filters.apply")} style="blue" />
        <Button
          type="button"
          label={t("artists.filters.reset")}
          style="line"
          onClick={() => {
            setLocal({ genre: "", date: "" });
            onReset();
          }}
        />
      </div>
    </form>
  );
};

export default Filters;
