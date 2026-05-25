import { StyledInputBase } from "../StyledInput";

const StyledInputEmail: React.FC<{
  label: string;
  value: string;
  setValue: (value: string) => void;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({ label, value, setValue, required, className, style }) => (
  <StyledInputBase
    label={label}
    value={value}
    setValue={setValue}
    type="email"
    className={className ?? ""}
  >
    <input
      type="email"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={label}
      required={required}
      style={style}
    />
  </StyledInputBase>
);

export default StyledInputEmail;
