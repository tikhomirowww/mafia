"use client";

import { motion } from "framer-motion";
import { Check, Gift, Crown } from "lucide-react";
import { useLang } from "@/context/LangContext";
import SectionBg from "@/components/ui/section-bg";

export default function Pricing() {
  const { t } = useLang();
  const p = t.pricing;

  return (
    <section id="pricing" className="py-24 bg-bg-primary relative overflow-hidden">
      <SectionBg variant="gold" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-medium mb-3">
            {p.subtitle}
          </p>
          <h2 className="font-cinzel font-bold text-4xl sm:text-5xl text-white">
            {p.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main pricing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-3 relative bg-gradient-to-br from-bg-elevated to-bg-card border border-gold/20 rounded-xl p-8 overflow-hidden glow-gold-box"
          >
            {/* BG glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-dim/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="font-cinzel font-bold text-white text-2xl mb-2">
                  {p.main.title}
                </h3>
                <p className="text-text-muted text-sm">{p.main.note}</p>
              </div>

              <div className="flex-shrink-0 text-center">
                <div className="font-cinzel font-black text-7xl text-gold-gradient leading-none">
                  {p.main.price}
                </div>
                <div className="text-text-muted text-sm mt-1">{p.main.unit}</div>
              </div>
            </div>

            <div className="red-divider my-6" />

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {p.main.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-white/80 text-sm">
                  <Check size={14} className="text-gold flex-shrink-0" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Prepay */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-1 bg-bg-card border border-white/5 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Crown size={18} className="text-gold" aria-hidden="true" />
              <h3 className="font-cinzel font-semibold text-white text-base">
                {p.prepay.title}
              </h3>
            </div>
            <div className="font-cinzel font-bold text-3xl text-gold mb-3">
              {p.prepay.amount}
            </div>
            <p className="text-text-muted text-sm leading-relaxed">{p.prepay.note}</p>
          </motion.div>

          {/* Loyalty */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2 bg-gradient-to-b from-bg-elevated/50 to-bg-card border border-white/5 hover:border-gold/20 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors duration-300"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gold-dim/30 border border-gold/20 flex items-center justify-center">
              <Gift size={24} className="text-gold" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-cinzel font-semibold text-white text-base mb-1">
                {p.loyalty.title}
              </h3>
              <p className="text-gold font-bold text-lg mb-1">{p.loyalty.description}</p>
              <p className="text-text-muted text-sm">{p.loyalty.note}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
