import { StyledInputBase } from "../StyledInput";

const StyledInputTextArea: React.FC<{
  label?: string;
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  width?: string;
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
}) => (
  <StyledInputBase
    label={label}
    value={value}
    setValue={setValue}
    type="text"
    className={className ?? ""}
    width={width}
  >
    <textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder ? placeholder : ""}
      required={required}
      style={style}
      id={id}
    />
  </StyledInputBase>
);

export default StyledInputTextArea;
