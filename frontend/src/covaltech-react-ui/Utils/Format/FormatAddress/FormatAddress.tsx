import React from "react";
import CopyButton from "../../../CopyButton/CopyButton";
import "./FormatAddress.scss";

interface FormatAddressProps {
  hex: string;
  start?: number;
  end?: number;
  full?: boolean;
  className?: string;
  copiable?: boolean;
}

const FormatAddress: React.FC<FormatAddressProps> = ({
  hex,
  start = 7,
  end = 6,
  className,
  full = false,
  copiable = false,
}) => {
  function formatAddress(): string {
    if (full) return hex;
    else if (hex) {
      const firstPart = hex.substring(0, start);
      const lastPart = hex.substring(hex.length - end);
      return `${firstPart}...${lastPart}`;
    } else {
      return "";
    }
  }

  return (
    <span className={`formatAddress ${className ? className : ""}`}>
      {formatAddress()}
      {copiable && <CopyButton message={hex} width={19} height={19} />}
    </span>
  );
};

export default FormatAddress;
