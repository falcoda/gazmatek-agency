import "./CopyButton.scss";

import React, { useState } from "react";

import toast from "react-hot-toast";
import Button from "../Button/Button";
import Copy from "./copy.svg?react";

interface CopyButtonProps {
  message: string;
  className?: string;
  label?: string;
  width?: number | string;
  height?: number;
  reverse?: boolean;
  onClick?: () => void;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  message,
  className,
  label,
  width = label ? undefined : 24,
  height = label ? undefined : 24,
  reverse = false,
  onClick,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (onClick) await onClick();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1100);
    } catch (err) {
      console.error("Clipboard write failed", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <>
      <div
        className={`${className ?? ""} copyButton`}
        aria-label={`Copy ${message} to clipboard`}
        role="button"
      >
        <Button
          onClick={copyToClipboard}
          className={`toolsBarCopyButton ${copied ? "active" : ""} ${
            reverse ? "reverse" : ""
          }`}
          icon={<Copy />}
          label={label}
          style={label ? "transparent" : "square"}
          height={height ?? "auto"}
          width={width}
          padding="0"
        />
        {copied && (
          <div className={`copiedMessage ${copied ? "active" : ""}`}>
            Copied
          </div>
        )}
      </div>
    </>
  );
};

export default CopyButton;
