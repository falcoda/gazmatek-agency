import "./SignaturePad.scss";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef } from "react";

interface SignaturePadProps {
  /** Called with the PNG data URL after each stroke, or `null` when cleared. */
  onChange: (dataUrl: string | null) => void;
  /** Optional hint shown below the canvas. */
  hint?: string;
  /** Bump this value to clear the canvas and reset the signature. */
  resetKey?: number;
}

const DISPLAY_STROKE = "#ffffff";
const EXPORT_STROKE = "#141414";

const initCanvas = (
  canvas: HTMLCanvasElement,
  strokeStyle: string,
  width: number,
  height: number,
) => {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(width * ratio));
  canvas.height = Math.max(1, Math.floor(height * ratio));

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.scale(ratio, ratio);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 2.8;
  ctx.strokeStyle = strokeStyle;
  ctx.clearRect(0, 0, width, height);

  return ctx;
};

const SignaturePad = ({ onChange, hint, resetKey = 0 }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const exportCanvas = exportCanvasRef.current;
    if (!canvas || !exportCanvas) return;

    const rect = canvas.getBoundingClientRect();
    initCanvas(canvas, DISPLAY_STROKE, rect.width, rect.height);
    initCanvas(exportCanvas, EXPORT_STROKE, rect.width, rect.height);
    onChange(null);
  }, [onChange, resetKey]);

  const getPoint = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const drawSegment = (
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
  ) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const point = getPoint(event);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const exportCtx = exportCanvasRef.current?.getContext("2d");
    if (!point || !canvas || !ctx || !exportCtx) return;

    drawingRef.current = true;
    lastPointRef.current = point;
    canvas.setPointerCapture(event.pointerId);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    exportCtx.beginPath();
    exportCtx.moveTo(point.x, point.y);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const point = getPoint(event);
    const ctx = canvasRef.current?.getContext("2d");
    const exportCtx = exportCanvasRef.current?.getContext("2d");
    if (!point || !ctx || !exportCtx) return;

    const prev = lastPointRef.current ?? point;
    drawSegment(ctx, prev, point);
    drawSegment(exportCtx, prev, point);
    lastPointRef.current = point;
  };

  const finishStroke = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    onChange(exportCanvasRef.current?.toDataURL("image/png") ?? null);
  };

  return (
    <div className="signaturePad">
      <canvas
        ref={canvasRef}
        className="padCanvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerLeave={finishStroke}
      />
      <canvas ref={exportCanvasRef} className="exportCanvas" aria-hidden />
      {hint ? <p className="padHint">{hint}</p> : null}
    </div>
  );
};

export default SignaturePad;
