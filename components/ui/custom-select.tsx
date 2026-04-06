"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Выберите...",
  id,
  disabled = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative" id={id}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={[
          "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg text-sm transition-all duration-200 text-left",
          "bg-bg-elevated border",
          open
            ? "border-red-neon ring-1 ring-red-neon/30"
            : "border-white/10 hover:border-white/25",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          selected ? "text-white" : "text-text-dim",
        ].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-text-dim"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 mt-1 w-full bg-bg-elevated border border-white/10 rounded-lg overflow-hidden shadow-xl shadow-black/50"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={[
                    "flex items-center justify-between gap-2 px-4 py-3 text-sm cursor-pointer transition-colors duration-150",
                    isSelected
                      ? "bg-red-neon/10 text-red-neon"
                      : "text-white/80 hover:bg-white/5 hover:text-white",
                  ].join(" ")}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={14} className="shrink-0" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
