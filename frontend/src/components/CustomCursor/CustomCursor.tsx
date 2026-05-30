import "./CustomCursor.scss";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "[role='button']",
  "input",
  "textarea",
  "select",
  "label",
  "summary",
  "[data-cursor='hover']",
].join(",");

const CURSOR_POSITION_KEY = "__gzkCursorPosition";

type CursorPointer = {
  x: number;
  y: number;
};

const CustomCursor = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  const coreRef = useRef<HTMLDivElement>(null);
  const glyphRef = useRef<HTMLDivElement>(null);
  const targetPointerRef = useRef({ x: 0, y: 0 });
  const corePointerRef = useRef({ x: 0, y: 0 });
  const glyphPointerRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateEnabled = () => {
      setIsEnabled(hoverQuery.matches && !motionQuery.matches);
    };

    updateEnabled();
    hoverQuery.addEventListener("change", updateEnabled);
    motionQuery.addEventListener("change", updateEnabled);

    return () => {
      hoverQuery.removeEventListener("change", updateEnabled);
      motionQuery.removeEventListener("change", updateEnabled);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const windowWithCursorPosition = window as Window & {
      [CURSOR_POSITION_KEY]?: CursorPointer;
    };

    const persistedPointer = windowWithCursorPosition[CURSOR_POSITION_KEY];

    targetPointerRef.current = persistedPointer ?? {
      x: Math.round(window.innerWidth / 2),
      y: Math.round(window.innerHeight / 2),
    };

    corePointerRef.current = { ...targetPointerRef.current };
    glyphPointerRef.current = { ...targetPointerRef.current };

    const applyPosition = (
      element: HTMLDivElement | null,
      x: number,
      y: number,
    ) => {
      if (!element) {
        return;
      }

      element.style.setProperty("--cursor-x", `${x}px`);
      element.style.setProperty("--cursor-y", `${y}px`);
    };

    const updateInteractiveState = (target: Element | null) => {
      const interactiveTarget = target?.closest(INTERACTIVE_SELECTOR);

      document.body.classList.toggle(
        "gzkCursorInteractive",
        Boolean(interactiveTarget),
      );
    };

    const setCursorEnabled = (enabled: boolean) => {
      document.body.classList.toggle("gzkCursorEnabled", enabled);
    };

    const setCursorVisible = (visible: boolean) => {
      document.body.classList.toggle("gzkCursorVisible", visible);
    };

    const FRAME_DURATION_60 = 1000 / 60;
    let lastTimestamp = 0;

    const tick = (timestamp: number) => {
      const dt =
        lastTimestamp === 0 ? FRAME_DURATION_60 : timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      const coreAlpha = 1 - Math.pow(1 - 0.42, dt / FRAME_DURATION_60);
      const glyphAlpha = 1 - Math.pow(1 - 0.24, dt / FRAME_DURATION_60);

      const nextCoreX =
        corePointerRef.current.x +
        (targetPointerRef.current.x - corePointerRef.current.x) * coreAlpha;
      const nextCoreY =
        corePointerRef.current.y +
        (targetPointerRef.current.y - corePointerRef.current.y) * coreAlpha;
      const nextGlyphX =
        glyphPointerRef.current.x +
        (targetPointerRef.current.x - glyphPointerRef.current.x) * glyphAlpha;
      const nextGlyphY =
        glyphPointerRef.current.y +
        (targetPointerRef.current.y - glyphPointerRef.current.y) * glyphAlpha;

      corePointerRef.current = { x: nextCoreX, y: nextCoreY };
      glyphPointerRef.current = { x: nextGlyphX, y: nextGlyphY };

      applyPosition(coreRef.current, nextCoreX, nextCoreY);
      applyPosition(glyphRef.current, nextGlyphX, nextGlyphY);

      frameRef.current = window.requestAnimationFrame(tick);
    };

    const syncInteractiveStateFromPoint = (x: number, y: number) => {
      updateInteractiveState(document.elementFromPoint(x, y));
    };

    applyPosition(
      coreRef.current,
      targetPointerRef.current.x,
      targetPointerRef.current.y,
    );
    applyPosition(
      glyphRef.current,
      targetPointerRef.current.x,
      targetPointerRef.current.y,
    );
    setCursorEnabled(true);
    setCursorVisible(true);

    const onMove = (e: PointerEvent) => {
      targetPointerRef.current = { x: e.clientX, y: e.clientY };
      windowWithCursorPosition[CURSOR_POSITION_KEY] = targetPointerRef.current;
      setCursorEnabled(true);
      setCursorVisible(true);
      syncInteractiveStateFromPoint(e.clientX, e.clientY);
    };

    const onPointerLeave = () => {
      setCursorEnabled(false);
      setCursorVisible(false);
      document.body.classList.remove("gzkCursorInteractive", "gzkCursorDown");
    };

    const onPointerEnter = (e: PointerEvent) => {
      targetPointerRef.current = { x: e.clientX, y: e.clientY };
      corePointerRef.current = { ...targetPointerRef.current };
      glyphPointerRef.current = { ...targetPointerRef.current };
      applyPosition(coreRef.current, e.clientX, e.clientY);
      applyPosition(glyphRef.current, e.clientX, e.clientY);
      windowWithCursorPosition[CURSOR_POSITION_KEY] = targetPointerRef.current;
      setCursorEnabled(true);
      setCursorVisible(true);
      syncInteractiveStateFromPoint(e.clientX, e.clientY);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setCursorEnabled(false);
        setCursorVisible(false);
        document.body.classList.remove("gzkCursorInteractive", "gzkCursorDown");
        return;
      }
      setCursorEnabled(true);
    };

    const onPointerDown = () => {
      document.body.classList.add("gzkCursorDown");
    };

    const onPointerUp = () => {
      document.body.classList.remove("gzkCursorDown");
    };

    frameRef.current = window.requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointerenter", onPointerEnter);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointerenter", onPointerEnter);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.body.classList.remove("gzkCursorInteractive", "gzkCursorDown");
      setCursorEnabled(false);
      setCursorVisible(false);
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return createPortal(
    <>
      <div ref={coreRef} className="customCursorCore" />
      <div ref={glyphRef} className="customCursorGlyph" />
    </>,
    document.body,
  );
};

export default CustomCursor;
