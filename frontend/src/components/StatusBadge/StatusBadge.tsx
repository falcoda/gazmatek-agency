import "./StatusBadge.scss";

import type { ReactNode } from "react";

export type StatusTone = "warning" | "info" | "success" | "danger" | "neutral";

const TONE_MODIFIER: Record<StatusTone, string> = {
  warning: "isWarning",
  info: "isInfo",
  success: "isSuccess",
  danger: "isDanger",
  neutral: "isNeutral",
};

interface StatusBadgeProps {
  tone: StatusTone;
  children: ReactNode;
}

const StatusBadge = ({ tone, children }: StatusBadgeProps) => {
  return (
    <span className={`statusBadge ${TONE_MODIFIER[tone]}`}>{children}</span>
  );
};

export default StatusBadge;
