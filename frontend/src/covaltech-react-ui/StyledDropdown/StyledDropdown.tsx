import "./StyledDropdown.scss";

import { useEffect, useRef, useState } from "react";

import { ChevronDown, GrClose } from "../../assets/svg/svgIcons";
import StyledInputText from "../StyledInput/StyledInputText/StyledInputText";

interface StyledDropdownProps<T> {
  value: T | undefined;
  setValue: (value: T | undefined) => void;
  itemList: T[];
  label?: string;
  itemLabelKey: keyof T;
  itemIdKey: keyof T;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  width?: string;
  search?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StyledDropdown = <T extends { [key: string]: any }>({
  value,
  setValue,
  itemList,
  label,
  itemLabelKey,
  itemIdKey,
  disabled = false,
  className = "",
  placeholder = "Search...",
  width = "200px",
  search,
}: StyledDropdownProps<T>) => {
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const handleClickItem = () => setIsComponentVisible(!isComponentVisible);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setItem = (itemId: any) => {
    const newItem = itemList.find((item) => item[itemIdKey] === itemId);
    if (newItem) setValue(newItem);
    setIsComponentVisible(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      ref.current &&
      !ref.current.contains(target) &&
      target.className !== "itemName" &&
      target.className !== "searchInput" &&
      !target.className.includes("placeholderName") &&
      !target.className.includes("productName") &&
      !target.className.includes("selectName") &&
      !target.className.includes("selectMenuName")
    ) {
      setIsComponentVisible(false);
    }
  };

  useEffect(() => {
    if (isComponentVisible) {
      document.addEventListener("click", handleClickOutside, true);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isComponentVisible]);

  const filteredItems = itemList.filter((item) =>
    item[itemLabelKey].toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      className={`styledDropdown ${disabled ? "disabled" : ""} ${className}`}
      style={{ width: width }}
    >
      {label && <span className="label">{label}</span>}
      <div className="selectElement">
        <div className={`selectMenu ${isComponentVisible ? "active" : ""}`}>
          <div className="selectMenuName" onClick={handleClickItem}>
            <div className="selectName">
              {value && value[itemLabelKey] ? (
                <span className="placeholderName">{value[itemLabelKey]}</span>
              ) : (
                <span className="placeholderName">{placeholder}</span>
              )}
            </div>
            <ChevronDown className="arrowDown" />
          </div>
          <div className="submenu" ref={ref}>
            <div className="subselectItemTitle">
              <span>Choose {label && label.toLowerCase()}</span>
              <GrClose onClick={() => setIsComponentVisible(false)} />
            </div>
            <div className="submenuItemsContainer">
              {search && (
                <StyledInputText
                  value={searchTerm}
                  label=""
                  setValue={(e: string) => setSearchTerm(e)}
                  placeholder="Search..."
                />
              )}
              {filteredItems.map((item) => (
                <div
                  className="subselectItem"
                  key={itemIdKey.toString() + item[itemIdKey]}
                  onClick={() => setItem(item[itemIdKey])}
                >
                  <span>{item[itemLabelKey]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyledDropdown;
