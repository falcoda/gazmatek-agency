import { ReactElement, useEffect } from "react";
import Button from "../Button/Button";
import useWindowWidth from "../hooks/useWindowWidth";
import useHeaderBannerStore from "../stores/HeaderBannerStore";
import BurgerClose from "./burger-close.svg?react";
import "./HeaderBanner.scss";

interface HeaderBannerProps {
  message: string | ReactElement;
  messageKey?: string; // Optionnel: clé unique pour les messages JSX
}

const HeaderBanner = ({ message, messageKey }: HeaderBannerProps) => {
  const { visible, setVisible, height, setHeight } = useHeaderBannerStore();
  const { isMobile } = useWindowWidth();

  // On mount & when message changes, decide visibility based on localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return; // safety for SSR
    try {
      const dismissedMessage = localStorage.getItem("headerBannerDismissed");
      // Utiliser messageKey si fourni, sinon utiliser le message string, sinon créer une clé basée sur le contenu
      const messageString =
        messageKey ||
        (typeof message === "string" ? message : `jsx-message-${Date.now()}`);
      if (dismissedMessage === messageString) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    } catch (e) {
      // Fallback: show banner if localStorage not accessible
      setVisible(true);
    }
  }, [message, messageKey, setVisible]);

  useEffect(() => {
    if (isMobile && height !== 50) {
      setHeight(50);
    }
  }, [isMobile]);

  if (!visible) {
    return null;
  }

  return (
    <div className="headerBannerContainer">
      <div className="headerBanner" style={{ height: height }}>
        <span>{message}</span>
        <Button
          onClick={() => {
            try {
              if (typeof window !== "undefined") {
                const messageString =
                  messageKey ||
                  (typeof message === "string"
                    ? message
                    : `jsx-message-${Date.now()}`);
                localStorage.setItem("headerBannerDismissed", messageString);
              }
            } catch (e) {
              // ignore storage failure
            }
            setVisible(false);
          }}
          style="transparent"
          width={20}
          height={20}
        >
          <BurgerClose />
        </Button>
      </div>
    </div>
  );
};

export default HeaderBanner;
