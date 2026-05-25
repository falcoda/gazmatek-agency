import React, { useEffect, useState } from "react";
import { breakpoints } from "../../../config/breakpoints";
import ExternalLink from "./externalLink.svg?react";
import "./FormatTransaction.scss";
interface FormatTransactionProps {
  transactionId: string;
  start?: number;
  end?: number;
  className?: string;
  explorer: string;
  showIcon?: boolean;
}

const FormatTransaction: React.FC<FormatTransactionProps> = ({
  transactionId,
  start,
  end,
  className,
  explorer,
  showIcon = false,
}) => {
  const [formattedTransaction, setFormattedTransaction] =
    useState(transactionId);

  useEffect(() => {
    if (!transactionId) return;
    if (start && end) {
      setFormattedTransaction(
        transactionId.substring(0, start) +
          "..." +
          transactionId.substring(transactionId.length - end),
      );
      return;
    }
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth <= breakpoints["breakpoint-sm"]) {
        setFormattedTransaction(
          transactionId.substring(0, 6) +
            "..." +
            transactionId.substring(transactionId.length - 6),
        );
      } else if (screenWidth <= breakpoints["breakpoint-lg-2"]) {
        setFormattedTransaction(
          transactionId.substring(0, 12) +
            "..." +
            transactionId.substring(transactionId.length - 12),
        );
      } else if (screenWidth <= breakpoints["breakpoint-lg"]) {
        setFormattedTransaction(
          transactionId.substring(0, 15) +
            "..." +
            transactionId.substring(transactionId.length - 15),
        );
      } else {
        setFormattedTransaction(transactionId);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [transactionId]);

  return (
    <a
      className={`formatTransaction ${className ? className : ""}`}
      href={`${explorer}${explorer.endsWith("/") ? "" : "/"}tx/${transactionId}`}
      target="_blank"
      rel="noreferrer"
    >
      {formattedTransaction}
      {showIcon && <ExternalLink />}
    </a>
  );
};

export default FormatTransaction;
