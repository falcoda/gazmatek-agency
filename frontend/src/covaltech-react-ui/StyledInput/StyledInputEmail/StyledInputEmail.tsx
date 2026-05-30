import { StyledInputBase } from "../StyledInput";

const StyledInputEmail: React.FC<{
  label: string;
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  width?: string;
}> = ({
  label,
  placeholder,
  value,
  setValue,
  required,
  className,
  style,
  width,
}) => (
  <StyledInputBase
    label={label}
    value={value}
    setValue={setValue}
    type="email"
    className={className ?? ""}
    width={width}
  >
    <input
      type="email"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder ?? label}
      required={required}
      style={style}
    />
  </StyledInputBase>
);

export default StyledInputEmail;
