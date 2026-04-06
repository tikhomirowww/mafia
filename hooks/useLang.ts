"use client";

import { useState, useEffect, useCallback } from "react";
import { translations, type Lang } from "@/lib/translations";

const STORAGE_KEY = "mafia-vip-lang";

export function useLang() {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === "ru" || stored === "ky") {
      setLangState(stored);
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = translations[lang];

  return { lang, setLang, t };
}
