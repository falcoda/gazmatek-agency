import "./Calendar.scss";
import "./react-datepicker.scss";

import React from "react";
import DatePicker from "react-datepicker";

interface CalendarProps {
  inline?: boolean;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  label?: string;
  timeInputLabel?: string;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  showTimeInput?: boolean;
  className?: string;
  isClearable?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  inline = false,
  selectedDate,
  setSelectedDate,
  label,
  timeInputLabel = "Time:",
  minDate = new Date(new Date().getTime()),
  maxDate = undefined,
  dateFormat = "MM/dd/yyyy h:mm:ss aa",
  showTimeInput = true,
  className,
  isClearable = false,
}) => {
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <div className={`calendarDateSelect ${className ?? ""}`}>
      {label && <label>{label}</label>}
      {React.createElement(DatePicker as any, {
        selected: selectedDate,
        onChange: handleDateChange,
        inline,
        minDate,
        maxDate,
        timeInputLabel,
        dateFormat,
        showTimeInput,
        id: "dateInput",
        isClearable,
      })}
    </div>
  );
};

export default Calendar;
