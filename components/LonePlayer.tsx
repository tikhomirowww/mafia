"use client";

import { motion } from "framer-motion";
import { Users, Check } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { CONTACTS } from "@/lib/site-config";
import SectionBg from "@/components/ui/section-bg";

export default function LonePlayer() {
  const { t } = useLang();
  const l = t.lonePlayer;

  return (
    <section className="py-16 bg-bg-primary relative overflow-hidden">
      <SectionBg variant="subtle" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-bg-card border border-red-deep/30 rounded-2xl p-8 sm:p-10 overflow-hidden"
        >
          {/* Bg decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-deep/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-red-deep/20 border border-red-deep/40 flex items-center justify-center">
              <Users size={28} className="text-red-neon" aria-hidden="true" />
            </div>

            <div className="flex-1">
              <h2 className="font-cinzel font-bold text-white text-2xl sm:text-3xl mb-2">
                {l.title}
              </h2>
              <p className="text-red-neon font-medium mb-2">{l.subtitle}</p>
              <p className="text-text-muted text-sm mb-5 leading-relaxed">
                {l.description}
              </p>

              <ul className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
                {l.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-white/80">
                    <Check size={14} className="text-red-neon" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>

              <a
                href={CONTACTS.telegram_chat}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-neon hover:bg-red-mid text-white font-bold px-6 py-3 rounded-lg transition-colors duration-200 uppercase tracking-wider text-sm"
              >
                {l.cta} →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
