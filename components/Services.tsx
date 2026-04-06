"use client";

import { motion } from "framer-motion";
import { Check, Theater, Baby, Building2, Gift, ArrowRight } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { useBooking, type FormatId } from "@/context/BookingContext";
import SectionBg from "@/components/ui/section-bg";

const SERVICE_ICONS = [Theater, Baby, Building2, Gift];
const FORMAT_IDS: FormatId[] = ["adult", "kids", "corporate", "certificate"];

export default function Services() {
  const { t, lang } = useLang();
  const { setSelectedFormat } = useBooking();

  const handleBook = (formatId: FormatId) => {
    setSelectedFormat(formatId);
    document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const btnLabel = lang === "ru" ? "Забронировать" : "Брондоо";

  return (
    <section id="services" className="py-24 relative bg-bg-primary snap-section">
      <SectionBg variant="gold" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-medium mb-3">
            {t.services.subtitle}
          </p>
          <h2 className="font-cinzel font-bold text-4xl sm:text-5xl text-white">
            {t.services.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {t.services.items.map((item, i) => {
            const Icon = SERVICE_ICONS[i];
            const formatId = FORMAT_IDS[i];

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative bg-gradient-to-b from-bg-elevated/60 to-bg-card border border-white/[0.06] hover:border-gold/30 rounded-xl p-7 flex flex-col transition-all duration-300 overflow-hidden"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.04] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold-dim/40 border border-gold/20 flex items-center justify-center group-hover:bg-gold-dim/60 transition-colors duration-300">
                    <Icon size={20} className="text-gold" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-cinzel font-bold text-white text-xl leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-gold text-sm font-medium mt-0.5">{item.price}</p>
                  </div>
                </div>

                <p className="relative text-text-muted text-sm leading-relaxed mb-5">
                  {item.description}
                </p>

                <ul className="relative space-y-2 mb-6">
                  {item.details.map((d) => (
                    <li key={d} className="flex items-center gap-2.5 text-sm text-white/75">
                      <Check size={13} className="text-gold flex-shrink-0" aria-hidden="true" />
                      {d}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleBook(formatId)}
                  className="relative mt-auto inline-flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4 rounded-lg transition-all duration-200 uppercase tracking-wider cursor-pointer bg-red-neon/10 hover:bg-red-neon text-red-neon hover:text-white border border-red-neon/40 hover:border-red-neon"
                >
                  {btnLabel}
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
