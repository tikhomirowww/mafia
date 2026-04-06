"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import {
  motion,
  useMotionValue,
  animate,
  useTransform,
  type MotionValue,
} from "framer-motion";

const ITEM_H = 56;
const VISIBLE = 5;
const CONTAINER_H = ITEM_H * VISIBLE;
const COPIES = 5;
const MID = Math.floor(COPIES / 2); // 2 — center copy

const indexToY = (i: number) => (2 - i) * ITEM_H;
const yToRaw  = (y: number) => 2 - y / ITEM_H;

// ── Per-item — hooks allowed here ─────────────────────────────────────────────
function DrumItem({
  label,
  index,
  y,
  isSelected,
  isBooked,
}: {
  label: string;
  index: number;
  y: MotionValue<number>;
  isSelected: boolean;
  isBooked: boolean;
}) {
  const dist    = useTransform(y, (ly) => index - yToRaw(ly));
  const rotateX = useTransform(dist, [-2.5, 0, 2.5], [38, 0, -38]);
  const scale   = useTransform(dist, [-1.2, 0, 1.2], [0.78, 1.12, 0.78]);
  const opacity = useTransform(dist, [-2.2, -1, 0, 1, 2.2], [0.08, 0.38, 1, 0.38, 0.08]);

  return (
    <motion.div
      style={{ height: ITEM_H, rotateX, scale, opacity }}
      className="flex items-center justify-center gap-2"
    >
      {isBooked && <span className="w-1.5 h-1.5 rounded-full bg-red-neon shrink-0" />}
      <span className={[
        "font-cinzel tracking-widest leading-none",
        isSelected ? "text-white font-bold text-[1.15rem]"
          : isBooked ? "text-white/30 text-sm"
          : "text-white/65 text-sm",
      ].join(" ")}>
        {label}
      </span>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface Props {
  slots: string[];
  value: string;
  onChange: (v: string) => void;
  getStatus: (slot: string) => "available" | "booked";
}

export default function DrumTimePicker({ slots, value, onChange, getStatus }: Props) {
  const N = slots.length;

  // Extended list: COPIES repetitions for infinite feel
  const extSlots = useMemo(
    () => Array.from({ length: COPIES }, () => slots).flat(),
    [slots]
  );

  // Convert global ext-index → natural slot index
  const toNatural = (extIdx: number) => ((extIdx % N) + N) % N;
  // Convert natural → center-copy ext-index
  const toCenterExt = (natural: number) => MID * N + natural;

  const initExt = toCenterExt(Math.max(0, slots.indexOf(value)));
  const y = useMotionValue(indexToY(initExt));

  const dragging = useRef(false);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when value changes externally (e.g. format pre-selection resets time)
  useEffect(() => {
    const natural = slots.indexOf(value);
    if (natural >= 0) {
      animate(y, indexToY(toCenterExt(natural)), { type: "spring", stiffness: 280, damping: 30 });
    }
  }, [value, slots]); // eslint-disable-line react-hooks/exhaustive-deps

  // Find nearest available starting from extIdx
  const nearestAvailable = useCallback(
    (extIdx: number): number => {
      const c = Math.max(0, Math.min(extSlots.length - 1, Math.round(extIdx)));
      for (let r = 0; r < extSlots.length; r++) {
        for (const i of [c - r, c + r]) {
          if (i >= 0 && i < extSlots.length && getStatus(extSlots[i]) === "available") return i;
        }
      }
      return c;
    },
    [extSlots, getStatus]
  );

  const snap = useCallback(
    (currentY: number) => {
      const rawIdx = yToRaw(currentY);
      // Which copy is the user near?
      const copyIdx = Math.max(0, Math.min(COPIES - 1, Math.round(rawIdx / N)));
      const roundedInCopy = copyIdx * N + ((Math.round(rawIdx) % N + N) % N);
      const targetExt = nearestAvailable(roundedInCopy);
      const naturalIdx = toNatural(targetExt);

      // 1. Animate to the visually nearest position (smooth)
      animate(y, indexToY(targetExt), { type: "spring", stiffness: 300, damping: 34 })
        .then(() => {
          // 2. After animation: teleport to center-copy equivalent (invisible — same y)
          const centerTarget = toCenterExt(naturalIdx);
          if (targetExt !== centerTarget) {
            y.set(indexToY(centerTarget));
          }
        });

      onChange(slots[naturalIdx]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nearestAvailable, slots, onChange, y, N]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const dragTop    = indexToY(extSlots.length - 1);
      const dragBottom = indexToY(0);
      const next = Math.max(dragTop, Math.min(dragBottom, y.get() - e.deltaY * 0.55));
      animate(y, next, { duration: 0.04 });
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => {
        if (!dragging.current) snap(y.get());
      }, 200);
    },
    [extSlots.length, y, snap]
  );

  return (
    <div
      className="relative overflow-hidden rounded-xl bg-bg-elevated border border-white/10 select-none touch-none"
      style={{ height: CONTAINER_H, perspective: "500px" }}
      onWheel={handleWheel}
    >
      {/* Gradient fades */}
      <div className="absolute inset-x-0 top-0 z-20 pointer-events-none"
        style={{ height: ITEM_H * 2, background: "linear-gradient(to bottom,#141414 0%,transparent 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none"
        style={{ height: ITEM_H * 2, background: "linear-gradient(to top,#141414 0%,transparent 100%)" }} />

      {/* Center band */}
      <div className="absolute inset-x-0 z-10 pointer-events-none border-y border-red-neon/30 bg-red-neon/[0.06]"
        style={{ top: ITEM_H * 2, height: ITEM_H }} />

      {/* Drum */}
      <motion.div
        drag="y"
        dragConstraints={{ top: indexToY(extSlots.length - 1), bottom: indexToY(0) }}
        dragElastic={0}
        style={{ y, transformStyle: "preserve-3d" }}
        onDragStart={() => { dragging.current = true; }}
        onDragEnd={() => { dragging.current = false; snap(y.get()); }}
        className="cursor-grab active:cursor-grabbing"
      >
        {extSlots.map((slot, i) => (
          <DrumItem
            key={`${i}-${slot}`}
            label={slot}
            index={i}
            y={y}
            isSelected={i === toCenterExt(slots.indexOf(value))}
            isBooked={getStatus(slot) === "booked"}
          />
        ))}
      </motion.div>
    </div>
  );
}
