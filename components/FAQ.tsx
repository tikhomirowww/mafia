"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLang } from "@/context/LangContext";

export default function FAQ() {
  const { t } = useLang();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-bg-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(139,0,0,0.06),transparent)] pointer-events-none" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-medium mb-3">
            {t.faq.subtitle}
          </p>
          <h2 className="font-cinzel font-bold text-4xl sm:text-5xl text-white">
            {t.faq.title}
          </h2>
        </motion.div>

        <div className="space-y-2">
          {t.faq.items.map((item, i) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="bg-bg-card border border-white/5 hover:border-white/10 rounded-xl overflow-hidden transition-colors duration-200"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                aria-expanded={openIdx === i}
              >
                <span className="font-medium text-white text-sm sm:text-base">
                  {item.question}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-red-neon flex-shrink-0 transition-transform duration-200 ${
                    openIdx === i ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence initial={false}>
                {openIdx === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-text-muted text-sm leading-relaxed border-t border-white/5 pt-4">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
