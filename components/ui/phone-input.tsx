"use client";

import { useCallback, useRef } from "react";

interface PhoneInputProps {
  value: string;             // stored as "+996XXXXXXXXX"
  onChange: (v: string) => void;
  placeholder?: string;
  hasError?: boolean;
}

/** Strip everything that's not a digit, drop leading 996 or 0, cap at 9 digits */
function toDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("996")) d = d.slice(3);
  else if (d.startsWith("0"))  d = d.slice(1);
  return d.slice(0, 9);
}

/** "+996700123456" → "700 123 456" (display only) */
function formatDisplay(stored: string): string {
  const d = toDigits(stored);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(" ");
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = "700 123 456",
  hasError = false,
}: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const emit = useCallback((digits: string) => {
    onChange("+996" + toDigits(digits));
  }, [onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    emit(e.target.value);
  }, [emit]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const digits = toDigits(pasted);
    onChange("+996" + digits);
    // Move cursor to end after React re-renders
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) el.setSelectionRange(el.value.length, el.value.length);
    });
  }, [onChange]);

  return (
    <div className={[
      "flex items-center rounded-lg border transition-colors duration-200 bg-bg-elevated",
      hasError
        ? "border-red-neon/60"
        : "border-white/10 hover:border-white/25 focus-within:border-red-neon focus-within:ring-1 focus-within:ring-red-neon/20",
    ].join(" ")}>
      {/* Static prefix */}
      <span className="pl-4 text-sm text-text-muted font-medium select-none shrink-0 pointer-events-none">
        +996
      </span>
      {/* Divider */}
      <span className="mx-2 text-white/15 select-none text-xs">|</span>
      {/* Digits input */}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={formatDisplay(value)}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder={placeholder}
        maxLength={11} // "XXX XXX XXX" = 11 chars with spaces
        className="flex-1 bg-transparent text-white placeholder:text-text-dim py-3 pr-4 text-sm outline-none min-w-0"
      />
    </div>
  );
}
