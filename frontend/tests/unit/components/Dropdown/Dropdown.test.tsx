import { renderWithProviders, screen, userEvent } from "@tests/testUtils";
import { describe, expect, it, vi } from "vitest";

import type { ValueList } from "@/components/Dropdown/Dropdown";
import Dropdown from "@/components/Dropdown/Dropdown";

const VALUE_LIST: ValueList[] = [
  { id: "support", name: "Support" },
  { id: "sales", name: "Sales" },
];

describe("Dropdown", () => {
  it("shows the translated placeholder when no value is selected", () => {
    renderWithProviders(
      <Dropdown value={undefined} setValue={vi.fn()} valueList={VALUE_LIST} />,
    );

    expect(screen.getByText("Subject*")).toBeInTheDocument();
  });

  it("shows the selected value name when a value is provided", () => {
    const { container } = renderWithProviders(
      <Dropdown
        value={VALUE_LIST[0]}
        setValue={vi.fn()}
        valueList={VALUE_LIST}
      />,
    );

    expect(container.querySelector(".dropdownName")?.textContent).toBe(
      "Support",
    );
    expect(screen.queryByText("Subject*")).not.toBeInTheDocument();
  });

  it("renders an entry for each item in the value list", () => {
    const { container } = renderWithProviders(
      <Dropdown value={undefined} setValue={vi.fn()} valueList={VALUE_LIST} />,
    );

    const items = container.querySelectorAll(".subDropdownMenu");
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toBe("Support");
    expect(items[1].textContent).toBe("Sales");
  });

  it("toggles the 'active' class when the menu is clicked", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <Dropdown value={undefined} setValue={vi.fn()} valueList={VALUE_LIST} />,
    );

    const menu = container.querySelector(".dropdownMenu");
    const trigger = container.querySelector(".dropdownMenuName");
    expect(menu).not.toBeNull();
    expect(menu).not.toHaveClass("active");

    await user.click(trigger as Element);
    expect(menu).toHaveClass("active");
  });

  it("calls setValue with the clicked item and closes the menu", async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();
    const { container } = renderWithProviders(
      <Dropdown value={undefined} setValue={setValue} valueList={VALUE_LIST} />,
    );

    await user.click(container.querySelector(".dropdownMenuName") as Element);
    await user.click(screen.getByText("Sales"));

    expect(setValue).toHaveBeenCalledWith(VALUE_LIST[1]);
    expect(container.querySelector(".dropdownMenu")).not.toHaveClass("active");
  });

  it("applies the disabled and custom class names to the wrapper", () => {
    const { container } = renderWithProviders(
      <Dropdown
        value={undefined}
        setValue={vi.fn()}
        valueList={VALUE_LIST}
        disabled
        className="custom"
      />,
    );

    const wrapper = container.querySelector(".dropdownDiv");
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass("dropdownDivDisabled");
    expect(wrapper).toHaveClass("custom");
  });
});
