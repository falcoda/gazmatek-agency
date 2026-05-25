import { StyledInputBase } from "../StyledInput";

const StyledInputTime: React.FC<{
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
    type="time"
    className={className ?? ""}
  >
    <input
      type="time"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required={required}
      style={style}
    />
  </StyledInputBase>
);

export default StyledInputTime;
