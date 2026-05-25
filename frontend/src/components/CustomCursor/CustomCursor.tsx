import "./CustomCursor.scss";

import { useCallback, useEffect, useRef } from "react";

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  const animate = useCallback(() => {
    ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
    ring.current.y += (mouse.current.y - ring.current.y) * 0.12;
    if (ringRef.current) {
      ringRef.current.style.left = `${ring.current.x}px`;
      ringRef.current.style.top = `${ring.current.y}px`;
    }
    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if ("ontouchstart" in window) return;

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };

    const onEnterInteractive = () => {
      if (dotRef.current) {
        dotRef.current.style.width = "6px";
        dotRef.current.style.height = "6px";
      }
      if (ringRef.current) {
        ringRef.current.style.width = "52px";
        ringRef.current.style.height = "52px";
      }
    };

    const onLeaveInteractive = () => {
      if (dotRef.current) {
        dotRef.current.style.width = "10px";
        dotRef.current.style.height = "10px";
      }
      if (ringRef.current) {
        ringRef.current.style.width = "36px";
        ringRef.current.style.height = "36px";
      }
    };

    document.addEventListener("mousemove", onMove);
    rafId.current = requestAnimationFrame(animate);

    const addHoverListeners = () => {
      document.querySelectorAll("a, button").forEach((el) => {
        el.addEventListener("mouseenter", onEnterInteractive);
        el.addEventListener("mouseleave", onLeaveInteractive);
      });
    };

    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId.current);
      observer.disconnect();
    };
  }, [animate]);

  if (typeof window !== "undefined" && "ontouchstart" in window) {
    return null;
  }

  return (
    <>
      <div ref={dotRef} className="customCursorDot" />
      <div ref={ringRef} className="customCursorRing" />
    </>
  );
};

export default CustomCursor;
