import "./StarRatingInput.scss";

import { FaRegStar, FaStar } from "react-icons/fa";

import { useThemeMode } from "@/covaltech-react-ui";

interface StarRatingInputProps {
  className?: string;
  /** Label for the optional clear button. When omitted, no clear button shows. */
  clearLabel?: string;
  /** Renders smaller star buttons. */
  compact?: boolean;
  /** Optional field label shown above the stars. */
  label?: string;
  /** Number of stars to render. Defaults to 5. */
  max?: number;
  setValue: (value: number | undefined) => void;
  value?: number | null;
}

const StarRatingInput = ({
  className,
  clearLabel,
  compact = false,
  label,
  max = 5,
  setValue,
  value,
}: StarRatingInputProps) => {
  const themeMode = useThemeMode();
  const currentValue = value ?? undefined;

  return (
    <div
      className={`starRatingInput ${compact ? "compact" : ""} ${
        themeMode === "dark" ? "dark" : "light"
      } ${className ?? ""}`.trim()}
    >
      {label || clearLabel ? (
        <div className="fieldHeader">
          {label ? <span className="label">{label}</span> : <span />}
          {clearLabel && currentValue !== undefined ? (
            <button
              type="button"
              className="clearButton"
              onClick={() => setValue(undefined)}
            >
              {clearLabel}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="starsRow">
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1;
          const isActive =
            currentValue !== undefined && starValue <= currentValue;

          return (
            <button
              key={starValue}
              type="button"
              className={`starButton ${isActive ? "active" : ""}`.trim()}
              onClick={() =>
                setValue(currentValue === starValue ? undefined : starValue)
              }
              title={`${starValue}/${max}`}
            >
              {isActive ? <FaStar /> : <FaRegStar />}
            </button>
          );
        })}

        <span className="valueLabel">
          {currentValue !== undefined ? `${currentValue}/${max}` : "—"}
        </span>
      </div>
    </div>
  );
};

export default StarRatingInput;
