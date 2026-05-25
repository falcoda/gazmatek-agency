import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import "./ToolTip.scss";

interface ToolTipProps {
  children: React.ReactNode;
  tooltip: React.ReactNode;
  onClose?: () => void; // New prop for closing the tooltip
}

const ToolTip = forwardRef((props: ToolTipProps, ref) => {
  const { children, tooltip, onClose } = props;
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const handleClickItem = () => {
    setShowTooltip((prev) => !prev);
  };

  useImperativeHandle(ref, () => ({
    closeTooltip() {
      setShowTooltip(false);
    },
  }));

  useEffect(() => {
    if (showTooltip && tooltipRef.current && titleRef.current) {
      const titleRect = titleRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      const newTop = titleRect.bottom + window.scrollY + 10; // Adding 10px below the tooltip title
      let newLeft =
        titleRect.left +
        window.scrollX -
        tooltipRect.width / 2 +
        titleRect.width / 2;

      // Ensure tooltip does not overflow off the screen
      if (newLeft + tooltipRect.width > window.innerWidth) {
        newLeft = window.innerWidth - tooltipRect.width - 10; // 10px padding from the right edge
      }

      if (newLeft < 0) {
        newLeft = 10; // 10px padding from the left edge
      }

      setPosition({
        top: newTop,
        left: newLeft,
      });

      // Show the tooltip after position is set
      setTooltipVisible(true);
    } else {
      // Hide the tooltip when showTooltip is false
      setTooltipVisible(false);
    }
  }, [showTooltip]);

  useEffect(() => {
    // Close the tooltip if clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".tooltipTitle")) {
        setShowTooltip(false);
        if (onClose) onClose(); // Trigger onClose callback if provided
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="tooltip">
      <div
        className="tooltipTitle"
        onClick={() => handleClickItem()}
        ref={titleRef}
      >
        {tooltip}
      </div>
      {showTooltip &&
        createPortal(
          <div
            className="tooltipContent"
            ref={tooltipRef}
            style={{
              position: "absolute",
              top: `${position.top}px`,
              left: `${position.left}px`,
              visibility: tooltipVisible ? "visible" : "hidden",
            }}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
});

ToolTip.displayName = "ToolTip";

export default ToolTip;
