"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";

const ITEM_H  = 52;   // px per item
const COPIES  = 5;
const MID     = 2;    // center copy index (0-based)
const VISIBLE = 5;    // visible rows

interface Props {
  slots: string[];
  value: string;
  onChange: (v: string) => void;
  getStatus: (slot: string) => "available" | "booked";
}

export default function DrumTimePicker({ slots, value, onChange, getStatus }: Props) {
  const N        = slots.length;
  const extSlots = useMemo(() => Array.from({ length: COPIES }, () => slots).flat(), [slots]);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef     = useRef<(HTMLDivElement | null)[]>([]);
  const isTeleporting = useRef(false);
  const scrollTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId         = useRef<number | null>(null);

  // Jump to ext-index with no scroll animation
  const jumpTo = useCallback((extIdx: number) => {
    if (!containerRef.current) return;
    isTeleporting.current = true;
    containerRef.current.scrollTop = extIdx * ITEM_H;
    requestAnimationFrame(() => { isTeleporting.current = false; });
  }, []);

  // Nearest available slot (circular)
  const nearestAvailable = useCallback((natural: number) => {
    if (getStatus(slots[natural]) === "available") return natural;
    for (let r = 1; r < N; r++) {
      const l = ((natural - r) % N + N) % N;
      const ri = (natural + r) % N;
      if (getStatus(slots[l])  === "available") return l;
      if (getStatus(slots[ri]) === "available") return ri;
    }
    return natural;
  }, [N, slots, getStatus]);

  // Apply 3D drum transforms directly to DOM (no React re-render needed)
  const applyTransforms = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    // Center of viewport in content coordinates:
    //   content starts with 2*ITEM_H padding, viewport center = ITEM_H * 2.5
    const centerContent = scrollTop + ITEM_H * 2.5;

    itemsRef.current.forEach((el, i) => {
      if (!el) return;
      // Item i center in content: 2*ITEM_H (padding) + i*ITEM_H + ITEM_H/2
      const itemCenter = ITEM_H * 2 + i * ITEM_H + ITEM_H / 2;
      const dist    = (itemCenter - centerContent) / ITEM_H; // in item units
      const absDist = Math.abs(dist);

      if (absDist > VISIBLE) {
        el.style.opacity   = "0";
        el.style.transform = "";
        return;
      }

      const rotateX = dist * 24;                                // degrees — cylinder tilt
      const scale   = Math.max(0.70, 1.12 - absDist * 0.15);   // larger at center
      const opacity = Math.max(0.06, 1 - absDist * 0.30);

      el.style.transform = `perspective(380px) rotateX(${rotateX}deg) scale(${scale})`;
      el.style.opacity   = String(opacity);
      // Transition only when not actively scrolling (snap phase)
      el.style.transition = "transform 0.12s ease, opacity 0.12s ease";
    });
  }, []);

  // Scroll handler: RAF for transforms + debounced snap
  const handleScroll = useCallback(() => {
    if (isTeleporting.current) return;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(applyTransforms);

    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      if (!containerRef.current || isTeleporting.current) return;
      const raw     = Math.round(containerRef.current.scrollTop / ITEM_H);
      const natural = ((raw % N) + N) % N;
      const target  = nearestAvailable(natural);
      jumpTo(MID * N + target);
      onChange(slots[target]);
    }, 130);
  }, [N, slots, nearestAvailable, onChange, jumpTo, applyTransforms]);

  // Mouse drag (skip touch — handled by native scroll)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startY = 0;
    let startTop = 0;
    let dragging = false;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      dragging = true;
      startY   = e.clientY;
      startTop = el.scrollTop;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerType === "touch") return;
      el.scrollTop = startTop - (e.clientY - startY);
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging || e.pointerType === "touch") return;
      dragging = false;
      el.releasePointerCapture(e.pointerId);
      el.style.cursor = "grab";
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup",   onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup",   onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // On mount: position to center copy
  useEffect(() => {
    const natural = Math.max(0, slots.indexOf(value));
    jumpTo(MID * N + natural);
    requestAnimationFrame(applyTransforms);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When slot list changes (date changed): reset to first slot
  useEffect(() => {
    jumpTo(MID * N);
    requestAnimationFrame(applyTransforms);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-bg-elevated border border-white/10">
      {/* Gradient fades */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{ height: ITEM_H * 2, background: "linear-gradient(to bottom,#141414 0%,transparent 100%)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: ITEM_H * 2, background: "linear-gradient(to top,#141414 0%,transparent 100%)" }}
      />

      {/* Center selection band */}
      <div
        className="absolute inset-x-0 z-10 pointer-events-none border-y border-red-neon/30 bg-red-neon/[0.06]"
        style={{ top: ITEM_H * 2, height: ITEM_H }}
      />

      {/* Scrollable drum */}
      <div
        ref={containerRef}
        onScroll={handleScroll}

        style={{
          height: ITEM_H * VISIBLE,
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="[&::-webkit-scrollbar]:hidden cursor-grab"
      >
        <div style={{ height: ITEM_H * 2, flexShrink: 0 }} />

        {extSlots.map((slot, i) => {
          const natural  = i % N;
          const copyIdx  = Math.floor(i / N);
          const isCenter = copyIdx === MID && slots[natural] === value;
          const booked   = getStatus(slot) === "booked";

          return (
            <div
              key={`${i}-${slot}`}
              ref={(el) => { itemsRef.current[i] = el; }}
              style={{ height: ITEM_H, scrollSnapAlign: "center", flexShrink: 0 }}
              className="flex items-center justify-center gap-2 will-change-transform"
            >
              {booked && <span className="w-1.5 h-1.5 rounded-full bg-red-neon shrink-0" />}
              <span className={[
                "font-cinzel tracking-widest select-none leading-none",
                isCenter
                  ? "text-white font-bold text-[1.1rem]"
                  : booked
                  ? "text-white/25 text-[0.8rem]"
                  : "text-white/65 text-[0.8rem]",
              ].join(" ")}>
                {slot}
              </span>
            </div>
          );
        })}

        <div style={{ height: ITEM_H * 2, flexShrink: 0 }} />
      </div>
    </div>
  );
}
