import React, { ReactElement } from "react";

interface FormatDateProps {
  timestamp: number;
  className?: string;
  full?: boolean;
  inline?: boolean;
  longFormat?: boolean;
}

const FormatDate: React.FC<FormatDateProps> = ({
  className,
  timestamp,
  full = false,
  inline = true,
  longFormat = false,
}) => {
  const formatDate = (): ReactElement => {
    if (!timestamp) {
      return <></>;
    }
    const date = new Date(
      timestamp.toString().length === 10 ? timestamp * 1000 : timestamp,
    );

    if (longFormat) {
      // Format américain avec mois en toutes lettres
      const dateOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
        timeZone: "UTC",
      };

      const dateString = date.toLocaleString("en-US", dateOptions);
      const timeString = date.toLocaleString("en-US", timeOptions);

      if (full || !inline) {
        return (
          <>
            <span>{dateString}</span>
            <br />
            <span>
              {timeString} <span style={{ fontSize: "0.8em" }}>UTC</span>
            </span>
          </>
        );
      } else {
        return <>{dateString}</>;
      }
    }

    const options: Intl.DateTimeFormatOptions = full
      ? {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        }
      : { year: "numeric", month: "numeric", day: "numeric" };

    const dateString = date.toLocaleString(undefined, options);

    if (full || !inline) {
      const [datePart, timePart] = dateString.split(" ");
      return (
        <>
          <span>{datePart}</span>
          <br />
          <span>{timePart}</span>
        </>
      );
    } else {
      return <>{dateString}</>;
    }
  };

  return (
    <span className={`formatDate ${className ?? ""}`}>{formatDate()}</span>
  );
};

export default FormatDate;
