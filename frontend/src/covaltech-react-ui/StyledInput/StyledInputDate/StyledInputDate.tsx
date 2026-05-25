import { StyledInputBase } from "../StyledInput";

const StyledInputDate: React.FC<{
  label: string;
  value: Date;
  setValue: (value: Date) => void;
  style?: React.CSSProperties;
  className?: string;
}> = ({ label, value, setValue, style, className }) => (
  <StyledInputBase
    label={label}
    value={value}
    setValue={setValue}
    style={style}
    type="date"
    className={className ?? ""}
  >
    <input
      type="date"
      value={value.toISOString().split("T")[0]}
      onChange={(e) => setValue(new Date(e.target.value))}
    />
  </StyledInputBase>
);

export default StyledInputDate;
