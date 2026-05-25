import { renderWithProviders } from "@tests/testUtils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SignaturePad from "@/components/SignaturePad/SignaturePad";

/**
 * jsdom does not implement the 2D canvas API. We provide a minimal stub so the
 * component can initialise the canvas, draw segments and export a data URL.
 */
const createContextStub = () =>
  ({
    scale: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    lineCap: "",
    lineJoin: "",
    lineWidth: 0,
    strokeStyle: "",
  }) as unknown as CanvasRenderingContext2D;

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() =>
    createContextStub(),
  ) as unknown as HTMLCanvasElement["getContext"];
  HTMLCanvasElement.prototype.toDataURL = vi.fn(
    () => "data:image/png;base64,STUB",
  );
  HTMLCanvasElement.prototype.setPointerCapture = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SignaturePad", () => {
  it("renders the canvas elements", () => {
    const { container } = renderWithProviders(
      <SignaturePad onChange={vi.fn()} />,
    );

    expect(container.querySelector(".signaturePad")).not.toBeNull();
    expect(container.querySelector(".padCanvas")).not.toBeNull();
    expect(container.querySelector(".exportCanvas")).not.toBeNull();
  });

  it("renders the hint text when provided", () => {
    const { container, getByText } = renderWithProviders(
      <SignaturePad onChange={vi.fn()} hint="Sign here" />,
    );

    expect(getByText("Sign here")).toBeInTheDocument();
    expect(container.querySelector(".padHint")).not.toBeNull();
  });

  it("omits the hint when none is provided", () => {
    const { container } = renderWithProviders(
      <SignaturePad onChange={vi.fn()} />,
    );

    expect(container.querySelector(".padHint")).toBeNull();
  });

  it("calls onChange with null on mount (clear)", () => {
    const onChange = vi.fn();
    renderWithProviders(<SignaturePad onChange={onChange} />);

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("clears the pad and calls onChange with null when resetKey changes", () => {
    const onChange = vi.fn();
    const { rerender } = renderWithProviders(
      <SignaturePad onChange={onChange} resetKey={0} />,
    );

    onChange.mockClear();
    rerender(<SignaturePad onChange={onChange} resetKey={1} />);

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("exports a data URL after a draw stroke", () => {
    const onChange = vi.fn();
    const { container } = renderWithProviders(
      <SignaturePad onChange={onChange} />,
    );
    const canvas = container.querySelector(".padCanvas") as HTMLCanvasElement;
    onChange.mockClear();

    canvas.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        pointerId: 1,
        clientX: 10,
        clientY: 10,
      }),
    );
    canvas.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        pointerId: 1,
        clientX: 40,
        clientY: 40,
      }),
    );
    canvas.dispatchEvent(
      new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }),
    );

    expect(onChange).toHaveBeenCalledWith("data:image/png;base64,STUB");
  });
});
