import "./FormatHex.scss";

import React, { useEffect, useState } from "react";

interface FormatHexProps {
  hex: string;
  start?: number;
  end?: number;
  className?: string;
}

const FormatHex: React.FC<FormatHexProps> = ({
  hex,
  start,
  end,
  className,
}) => {
  const [formattedHex, setFormattedHex] = useState(hex);

  useEffect(() => {
    if (!hex) return;
    if (start && end) {
      setFormattedHex(
        hex.substring(0, start) + "..." + hex.substring(hex.length - end),
      );
      return;
    }
  }, [hex]);

  return (
    <span className={`formatHex ${className ? className : ""}`}>
      {formattedHex}
    </span>
  );
};

export default FormatHex;
