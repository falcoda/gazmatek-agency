import "./Checkbox.scss";

import React from "react";

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked = false,
  onChange,
  label,
}) => {
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <label className="checkboxContainer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleCheckboxChange}
        className="checkboxInput"
      />
      {label && <span className="checkboxLabel">{label}</span>}
    </label>
  );
};

export default Checkbox;
