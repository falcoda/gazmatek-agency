import "./Button.scss";

import { forwardRef, ReactNode } from "react";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";

export type ButtonStyle =
  | "blue"
  | "white"
  | "transparent"
  | "line"
  | "square"
  | "danger"
  | "bordered-animed"
  | "undefined"
  | "bordered";

type ButtonProps = {
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  style?: ButtonStyle;
  className?: string;
  label?: string;
  icon?: ReactNode;
  isLoading?: boolean;
  height?: number | string;
  width?: number | string;
  margin?: string;
  padding?: string;
  disabled?: boolean;
  title?: string;
  children?: ReactNode;
  href?: string;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      onClick,
      className,
      label,
      icon,
      type = "button",
      style = "blue",
      isLoading,
      height,
      width,
      margin,
      padding,
      disabled = false,
      title,
      children,
      href,
    },
    ref,
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading) {
        toast.error("Please wait for the current action to finish");
        return;
      }

      // Open the link in a new tab if href is provided
      if (href) {
        window.open(href, "_blank");
        return;
      }
      if (onClick) onClick(e);
    };
    return (
      <button
        onClick={handleClick}
        className={`${className ?? ""} styledButton ${style}`}
        type={type}
        style={{
          height: height,
          minHeight: height,
          width: width,
          margin: margin,
          padding: padding,
        }}
        disabled={disabled}
        title={title}
        ref={ref}
      >
        {isLoading ? (
          <FaSpinner className="loaderButton" />
        ) : (
          <>
            {label}
            {icon}
          </>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
