import "./Button.scss";

import type { ReactNode } from "react";
import { forwardRef } from "react";
import { toast } from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
import { Link } from "react-router";

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
  ariaLabel?: string;
  children?: ReactNode;
  href?: string;
  to?: string; // internal router link
  prefetch?: "intent" | "viewport" | "render";
  preventScrollReset?: boolean;
  replace?: boolean;
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
      ariaLabel,
      children,
      href,
      to,
      prefetch = "intent",
      preventScrollReset,
      replace,
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
    const classes = `${className ?? ""} styledButton ${style}`;

    // If `to` is provided, render as a Link styled like a button
    if (to) {
      return (
        <Link
          to={to}
          prefetch={prefetch}
          preventScrollReset={preventScrollReset}
          replace={replace}
          onClick={() => onClick?.()}
          className={classes}
          title={title}
          aria-label={ariaLabel}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            height,
            minHeight: height,
            width,
            margin,
            padding,
            pointerEvents: disabled ? "none" : undefined,
            opacity: disabled ? 0.6 : undefined,
          }}
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
        </Link>
      );
    }

    return (
      <button
        onClick={handleClick}
        className={classes}
        type={type}
        style={{
          height,
          minHeight: height,
          width,
          margin,
          padding,
        }}
        disabled={disabled}
        title={title}
        aria-label={ariaLabel}
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
