import "./PopupMenu.scss";

import { ReactElement, useEffect, useRef, useState } from "react";

import Button, { ButtonStyle } from "../Button/Button";
import Card from "../Utils/Containers/Card/Card";

interface PopupMenuProps {
  label?: string;
  icon?: ReactElement;
  children: React.ReactNode;
  className?: string;
  buttonStyle?: ButtonStyle;
  buttonHeight?: number | string;
  buttonWidth?: number | string;
}

const PopupMenu = ({
  label,
  icon,
  children,
  className,
  buttonStyle = "white",
  buttonHeight,
  buttonWidth,
}: PopupMenuProps) => {
  const [displayOptions, setDisplayOptions] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // close the options content when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        contentRef.current &&
        buttonRef.current &&
        !contentRef.current.contains(target) &&
        !buttonRef.current.contains(target)
      ) {
        setDisplayOptions(false);
      }
    };

    if (displayOptions) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [displayOptions]);

  return (
    <div className={`popupMenu ${className ?? ""}`}>
      <Button
        ref={buttonRef}
        onClick={() => setDisplayOptions(!displayOptions)}
        icon={icon}
        label={label}
        style={buttonStyle}
        width={buttonWidth}
        height={buttonHeight}
      />
      {displayOptions && (
        <div className={`popupMenuContent ${className ?? ""}`} ref={contentRef}>
          <Card>{children}</Card>
        </div>
      )}
    </div>
  );
};
export default PopupMenu;
