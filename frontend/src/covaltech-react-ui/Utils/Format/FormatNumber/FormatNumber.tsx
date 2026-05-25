import "./FormatNumber.scss";

import React from "react";

function formatUnits(
  value: string | number | bigint,

  decimals: number,
): string {
  const bigValue = BigInt(value.toString());

  const divisor = 10n ** BigInt(decimals);

  const integerPart = bigValue / divisor;

  const remainder = bigValue % divisor;

  if (remainder === 0n) return integerPart.toString();

  const decimalStr = remainder

    .toString()

    .padStart(decimals, "0")

    .replace(/0+$/, "");

  return `${integerPart}.${decimalStr}`;
}

interface FormatNumberProps {
  value: string | number | bigint;

  decimals?: number;

  toFixed?: number;

  alias?: string;

  colored?: boolean;

  className?: string;
}

const FormatNumber: React.FC<FormatNumberProps> = ({
  value,

  decimals,

  toFixed = 2,

  alias,

  colored,

  className,
}) => {
  function formatNumber(num: string | number | bigint): string {
    try {
      if (typeof num === "bigint" || typeof num === "string") {
        if (decimals) {
          num = formatUnits(value, decimals);
        }

        // Convert bigint or string to string representation

        let numStr = num.toString();

        let [integerPart, decimalPart = ""] = numStr.split(".");

        // Format integer part with commas

        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        // Truncate the decimal part to the specified toFixed length if it exists

        decimalPart = decimalPart.slice(0, toFixed);

        // Assemble formatted number

        return toFixed > 0 && decimalPart
          ? `${integerPart}.${decimalPart}`
          : integerPart;
      } else if (typeof num === "number") {
        if (Number.isNaN(num)) return "0";

        if (decimals) {
          num = Number(formatUnits(value, decimals));
        }

        // For very small numbers, avoid scientific notation and truncate without rounding

        if (Math.abs(num) < 1e-6 && num !== 0) {
          const numStr = num.toFixed(toFixed + 10); // Add 10 to avoid rounding errors

          const truncatedStr = numStr.slice(
            0,

            numStr.indexOf(".") + toFixed + 1,
          ); // Truncate the number without rounding

          return truncatedStr;
        }

        // Existing logic for number type (formatting, truncation, etc.)

        // Separate integer and decimal parts

        let [integerPart, decimalPart = ""] = num.toString().split(".");

        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        decimalPart = decimalPart.slice(0, toFixed);

        return toFixed > 0 && decimalPart
          ? `${integerPart}.${decimalPart}`
          : integerPart;
      }

      return "0"; // Default return for any unhandled case
    } catch (error) {
      console.error(error);

      return "0";
    }
  }

  const formattedValue = formatNumber(value);

  const isNegative = Number(value) < 0;

  const color = colored ? (isNegative ? "#F25050" : "#38C769") : "inherit";

  return (
    <span className={`formatNumberWrapper ${className ? className : ""}`}>
      <span className={`formatNumber`} style={{ color }} data-colored={colored}>
        {formattedValue}
      </span>

      {alias && (
        <span
          className={`formatNumberAlias`}
          style={{ color }}
          data-colored={colored}
        >
          &nbsp;
          {alias === "P" || alias === "JVM" ? "JUNE" : alias}
        </span>
      )}
    </span>
  );
};

export default FormatNumber;
