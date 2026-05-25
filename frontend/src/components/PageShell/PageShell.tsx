import "./PageShell.scss";

import { type ReactNode, useEffect } from "react";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * Layout shell for standalone pages rendered outside the AppShell grid
 * (auth, onboarding, ...). Owns the page surface background and restores
 * document scrolling. Page-specific layout is passed through `className`.
 */
const PageShell = ({ children, className }: PageShellProps) => {
  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return (
    <div className={`pageShell ${className ?? ""}`.trim()}>{children}</div>
  );
};

export default PageShell;
