import "./HeaderButtons.scss";

import React from "react";

import HelpMeWith from "../HelpMeWith/HelpMeWith";

interface Button {
  text: string;
  imageUrl?: string;
  imageAlt?: string;
}

interface HeaderButtonsProps {
  activeButton: string;
  setActiveButton?: (button: string) => void;
  buttons: Button[];
  showHelpMeWith?: boolean;
  helpMeWithText?: string;
  children?: React.ReactNode;
}

const HeaderButtons: React.FC<HeaderButtonsProps> = ({
  activeButton,
  setActiveButton,
  buttons,
  showHelpMeWith = false,
  helpMeWithText,
  children,
}) => {
  const activeIndex = buttons.findIndex(
    (button) => button.text === activeButton,
  );

  return (
    <div className="mainContainerHeaders">
      <div className="headerButtonsWrapper">
        {buttons.map(({ text, imageUrl, imageAlt }, index) => {
          const isActive = text === activeButton;
          let className = "headerButtons";
          if (isActive) {
            className += " activeButton";
          } else if (index === activeIndex - 1) {
            className += " nextToLeftActive";
          }

          return (
            <button
              key={text}
              className={className}
              onClick={() => setActiveButton && setActiveButton(text)}
            >
              <div className="buttonContent">
                {imageUrl && (
                  <img
                    className="buttonImage"
                    src={imageUrl}
                    alt={imageAlt || text}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.onerror = null; // Prevent infinite loop
                      e.currentTarget.src = "./img/chainLogo/default.png"; // Fallback image
                    }}
                  />
                )}
                {text.charAt(0).toUpperCase() + text.slice(1)}
              </div>
            </button>
          );
        })}
      </div>
      {showHelpMeWith && (
        <HelpMeWith text={helpMeWithText ?? ""} className="helpMeWith" />
      )}
      {children}
    </div>
  );
};

export default HeaderButtons;
