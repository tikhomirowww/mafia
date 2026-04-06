"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export const FORMAT_IDS = ["adult", "kids", "corporate", "certificate"] as const;
export type FormatId = typeof FORMAT_IDS[number];

interface BookingContextValue {
  selectedFormat: FormatId | "";
  setSelectedFormat: (f: FormatId | "") => void;
}

const BookingContext = createContext<BookingContextValue>({
  selectedFormat: "",
  setSelectedFormat: () => {},
});

export function BookingProvider({ children }: { children: ReactNode }) {
  const [selectedFormat, setSelectedFormat] = useState<FormatId | "">("");
  return (
    <BookingContext.Provider value={{ selectedFormat, setSelectedFormat }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
