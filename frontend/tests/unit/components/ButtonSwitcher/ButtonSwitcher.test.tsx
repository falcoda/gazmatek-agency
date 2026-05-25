import { renderWithProviders, screen, userEvent } from "@tests/testUtils";
import { describe, expect, it, vi } from "vitest";

import type { ButtonSwitcherValue } from "@/components/ButtonSwitcher/ButtonSwitcher";
import ButtonSwitcher from "@/components/ButtonSwitcher/ButtonSwitcher";

const DATAS: ButtonSwitcherValue[] = [
  { id: "list", name: "List" },
  { id: "grid", name: "Grid" },
];

describe("ButtonSwitcher", () => {
  it("renders a button for each data entry", () => {
    renderWithProviders(
      <ButtonSwitcher value={DATAS[0]} setValue={vi.fn()} datas={DATAS} />,
    );

    expect(screen.getByRole("button", { name: "List" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Grid" })).toBeInTheDocument();
  });

  it("marks the currently selected button with the 'selected' class", () => {
    renderWithProviders(
      <ButtonSwitcher value={DATAS[1]} setValue={vi.fn()} datas={DATAS} />,
    );

    expect(screen.getByRole("button", { name: "Grid" })).toHaveClass(
      "selected",
    );
    expect(screen.getByRole("button", { name: "List" })).not.toHaveClass(
      "selected",
    );
  });

  it("calls setValue with the clicked item", async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();
    renderWithProviders(
      <ButtonSwitcher value={DATAS[0]} setValue={setValue} datas={DATAS} />,
    );

    await user.click(screen.getByRole("button", { name: "Grid" }));

    expect(setValue).toHaveBeenCalledWith(DATAS[1]);
  });

  it("persists the selected id to localStorage when a key is provided", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ButtonSwitcher
        value={DATAS[0]}
        setValue={vi.fn()}
        datas={DATAS}
        localStorageKey="viewMode"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Grid" }));

    expect(localStorage.getItem("viewMode")).toBe("grid");
    localStorage.removeItem("viewMode");
  });

  it("does not touch localStorage when no key is provided", async () => {
    const user = userEvent.setup();
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    renderWithProviders(
      <ButtonSwitcher value={DATAS[0]} setValue={vi.fn()} datas={DATAS} />,
    );

    await user.click(screen.getByRole("button", { name: "List" }));

    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });

  it("applies an extra className to the wrapper", () => {
    const { container } = renderWithProviders(
      <ButtonSwitcher
        value={DATAS[0]}
        setValue={vi.fn()}
        datas={DATAS}
        className="custom"
      />,
    );

    const wrapper = container.querySelector(".buttonSwitcher");
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass("custom");
  });
});
