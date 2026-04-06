"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface CustomDatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",
];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayStr() {
  const t = new Date();
  return toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
}

export default function CustomDatePicker({
  value,
  onChange,
  id,
  placeholder = "Выберите дату",
}: CustomDatePickerProps) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const today = todayStr();

  // Min selectable = today (slot-level 2h rule handles past slots)
  const minDate = now;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDow = (first.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const isPast = (d: number) => {
    const date = new Date(viewYear, viewMonth, d);
    return date < minDate;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const canGoPrev = () => {
    return viewYear > minDate.getFullYear() ||
      (viewYear === minDate.getFullYear() && viewMonth > minDate.getMonth());
  };

  return (
    <div ref={ref} className="relative" id={id}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={[
          "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg text-sm transition-all duration-200 text-left",
          "bg-bg-elevated border",
          open
            ? "border-red-neon ring-1 ring-red-neon/30"
            : "border-white/10 hover:border-white/25",
          value ? "text-white" : "text-text-dim",
        ].join(" ")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <CalendarDays size={16} className="shrink-0 text-text-dim" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Выбор даты"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 mt-1 w-72 bg-bg-elevated border border-white/10 rounded-xl p-4 shadow-xl shadow-black/50"
          >
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={prevMonth}
                disabled={!canGoPrev()}
                className="p-1 rounded-lg text-text-dim hover:text-white hover:bg-white/8 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-white font-cinzel">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded-lg text-text-dim hover:text-white hover:bg-white/8 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEK_DAYS.map(wd => (
                <div key={wd} className="text-center text-[10px] text-text-dim uppercase font-medium py-1">
                  {wd}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-px">
              {days.map((d, i) => {
                if (d === null) return <div key={`e-${i}`} />;
                const str = toDateStr(viewYear, viewMonth, d);
                const past = isPast(d);
                const selected = str === value;
                const isToday = str === today;

                return (
                  <button
                    key={str}
                    type="button"
                    disabled={past}
                    onClick={() => { onChange(str); setOpen(false); }}
                    className={[
                      "h-8 w-full flex items-center justify-center rounded-md text-xs font-medium transition-all duration-150 relative",
                      past
                        ? "text-text-dim/25 cursor-not-allowed"
                        : selected
                          ? "bg-red-neon text-white font-bold shadow-md shadow-red-neon/30"
                          : isToday
                            ? "text-gold border border-gold/50 hover:bg-gold/10 cursor-pointer"
                            : "text-white/80 hover:bg-white/8 hover:text-white cursor-pointer",
                    ].join(" ")}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            {/* Today button */}
            <button
              type="button"
              onClick={() => { onChange(today); setOpen(false); }}
              className="mt-3 w-full text-[11px] text-gold/70 hover:text-gold transition-colors duration-150 flex items-center justify-center gap-1.5"
            >
              <span className="inline-block w-2 h-2 border border-gold/50 rounded-sm" />
              сегодня
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
