import "./BookingDetailLayout.scss";

import type { ReactNode } from "react";

interface BookingDetailLayoutProps {
  children: ReactNode;
}

const BookingDetailLayout = ({ children }: BookingDetailLayoutProps) => {
  return <div className="bookingDetail">{children}</div>;
};

export default BookingDetailLayout;
