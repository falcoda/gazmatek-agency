import { formatDateInputValue, parseDateInputValue } from "@/Utils/Date/date";

import { StyledInputBase } from "../StyledInput";

interface StyledInputDateProps {
  label: string;
  value: Date;
  setValue: (value: Date) => void;
  style?: React.CSSProperties;
  className?: string;
  width?: string | number;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

const StyledInputDate = ({
  label,
  value,
  setValue,
  style,
  className,
  width,
  minDate,
  maxDate,
  required = false,
  disabled = false,
  id,
}: StyledInputDateProps) => (
  <StyledInputBase
    label={label}
    value={value}
    setValue={setValue}
    style={style}
    type="date"
    className={className ?? ""}
    width={width}
    htmlFor={id}
  >
    <input
      type="date"
      value={formatDateInputValue(value)}
      onChange={(event) => setValue(parseDateInputValue(event.target.value))}
      min={minDate ? formatDateInputValue(minDate) : undefined}
      max={maxDate ? formatDateInputValue(maxDate) : undefined}
      required={required}
      disabled={disabled}
      id={id}
    />
  </StyledInputBase>
);

export default StyledInputDate;
