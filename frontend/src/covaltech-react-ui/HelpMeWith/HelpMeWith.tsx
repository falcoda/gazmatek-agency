import "./HelpMeWith.scss";

import { ReactElement, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import useWindowWidth from "../hooks/useWindowWidth";
import Information from "./information.svg?react";

interface HelpMeWithProps {
  text: string | ReactElement;
  className?: string;
  align?: "left" | "right" | "center";
  width?: number | string;
}

interface Position {
  top: number;
  left: number;
  arrowLeft: number;
}

const HelpMeWith = ({
  text,
  className,
  align = "center",
  width,
}: HelpMeWithProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState<Position>({
    top: 0,
    left: 0,
    arrowLeft: 0,
  });
  const { isTabelet, windowWidth } = useWindowWidth();
  const iconRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!showTooltip || !iconRef.current || !tooltipRef.current) return;

    const iconRect = (iconRef.current as HTMLElement).getBoundingClientRect();
    const tooltipRect = (
      tooltipRef.current as HTMLElement
    ).getBoundingClientRect();

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Compute vertical position just under the icon
    const topPosition = iconRect.top + scrollY + iconRect.height + 5;

    let leftPosition: number;
    if (align === "left") {
      // Position tooltip to the left of the icon
      leftPosition = iconRect.left + scrollX - tooltipRect.width + 15;
    } else if (align === "right") {
      // Position tooltip to the right of the icon
      leftPosition = iconRect.right + scrollX - 15;
    } else if (isTabelet) {
      // On tablet/mobile, fallback to right-side
      leftPosition = iconRect.right + scrollX - tooltipRect.width;
    } else {
      // Center under the icon
      leftPosition =
        iconRect.left + scrollX + iconRect.width / 2 - tooltipRect.width / 2;
    }

    // Clamp tooltip within viewport
    const minLeft = 8;
    const maxLeft = windowWidth - tooltipRect.width - 8;
    leftPosition = Math.max(minLeft, Math.min(leftPosition, maxLeft));

    // Compute arrow center under icon
    const iconCenterX = iconRect.left + scrollX + iconRect.width / 2;
    let rawArrowLeft = iconCenterX - leftPosition;
    // Clamp arrow so it never reaches edges
    const ARROW_MARGIN = 8;
    const arrowLeft = Math.max(
      ARROW_MARGIN,
      Math.min(rawArrowLeft, tooltipRect.width - ARROW_MARGIN),
    );

    setPosition({ top: topPosition, left: leftPosition, arrowLeft });
  }, [showTooltip, windowWidth, align, isTabelet]);

  const handleMouseOver = () => setShowTooltip(true);
  const handleMouseOut = () => setShowTooltip(false);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setShowTooltip(false);
    }
  };

  // when user press escape key, close tooltip
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const tooltip = showTooltip && (
    <div
      ref={tooltipRef}
      className="helpMeWithTooltip"
      style={
        {
          top: position.top,
          left: position.left,
          zIndex: 9999,
          width: width
            ? typeof width === "number"
              ? `${width}px`
              : width
            : undefined,
          "--arrow-left": `${position.arrowLeft}px`,
        } as React.CSSProperties & { "--arrow-left": string }
      }
    >
      {text}
    </div>
  );

  return (
    <button
      className={`helpMeWith ${className ?? ""}`}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onFocus={handleMouseOver}
      onBlur={handleMouseOut}
      onClick={handleMouseOver}
      ref={iconRef}
      tabIndex={0}
    >
      <Information />
      {createPortal(tooltip, document.body)}
    </button>
  );
};

export default HelpMeWith;
