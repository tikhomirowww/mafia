"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { CONTACTS } from "@/lib/site-config";

export default function Navbar() {
  const { t, lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#about", label: t.nav.about },
    { href: "#services", label: t.nav.services },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#how", label: t.nav.howItWorks },
    { href: "#faq", label: t.nav.faq },
    { href: "#contacts", label: t.nav.contacts },
  ];

  const handleNav = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-bg-primary/95 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-cinzel font-bold text-xl text-white tracking-widest hover:text-red-neon transition-colors duration-200"
            aria-label="Mafia VIP — на главную"
          >
            MAFIA<span className="text-red-neon">.</span>VIP
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Навигация">
            {links.map((l) => (
              <button
                key={l.href}
                onClick={() => handleNav(l.href)}
                className="text-sm text-text-muted hover:text-white transition-colors duration-200 uppercase tracking-wider cursor-pointer"
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Right: lang + book */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "ru" ? "ky" : "ru")}
              className="text-xs font-medium text-text-muted hover:text-red-neon transition-colors duration-200 border border-white/10 hover:border-red-neon/40 rounded px-2.5 py-1.5 uppercase tracking-wider"
              aria-label="Переключить язык"
            >
              {t.nav.langSwitch}
            </button>

            <a
              href="#booking"
              onClick={(e) => {
                e.preventDefault();
                handleNav("#booking");
              }}
              className="hidden sm:flex items-center gap-1.5 bg-red-neon hover:bg-red-mid text-white text-sm font-semibold px-4 py-2 rounded transition-colors duration-200 uppercase tracking-wider"
            >
              {t.nav.booking}
            </a>

            {/* Burger */}
            <button
              className="lg:hidden text-white hover:text-red-neon transition-colors duration-200 p-1"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={open}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-bg-primary/98 backdrop-blur-md flex flex-col pt-20 px-6 pb-8"
          >
            <nav className="flex flex-col gap-6" aria-label="Мобильная навигация">
              {links.map((l, i) => (
                <motion.button
                  key={l.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  onClick={() => handleNav(l.href)}
                  className="text-left text-2xl font-cinzel text-white hover:text-red-neon transition-colors duration-200 border-b border-white/5 pb-4"
                >
                  {l.label}
                </motion.button>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3">
              <a
                href={CONTACTS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-red-neon text-white font-semibold py-3.5 rounded text-lg uppercase tracking-wider"
                onClick={() => setOpen(false)}
              >
                {t.nav.booking}
              </a>
              <button
                onClick={() => {
                  setLang(lang === "ru" ? "ky" : "ru");
                  setOpen(false);
                }}
                className="w-full text-center border border-white/20 text-text-muted py-3 rounded text-sm uppercase tracking-wider"
              >
                {lang === "ru" ? "Кыргызча" : "Русский"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
