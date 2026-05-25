import { StyledInputBase } from "../StyledInput";

const StyledInputText: React.FC<{
  label: string | React.ReactNode;
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  width?: string | number;
  disabled?: boolean;
  valid?: boolean;
}> = ({
  label,
  value,
  setValue,
  required,
  className,
  style,
  placeholder,
  id,
  width,
  disabled = false,
  valid = true,
}) => (
  <StyledInputBase
    label={label}
    value={value}
    setValue={setValue}
    type="text"
    className={className ?? ""}
    width={width}
  >
    <input
      type="text"
      className={`${!valid ? "invalid" : ""}`}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder ? placeholder : ""}
      required={required}
      style={style}
      id={id}
      disabled={disabled}
    />
  </StyledInputBase>
);

export default StyledInputText;
