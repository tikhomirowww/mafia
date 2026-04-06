"use client";

import { motion } from "framer-motion";
import { useLang } from "@/context/LangContext";

export default function HowItWorks() {
  const { t } = useLang();

  return (
    <section id="how" className="py-24 bg-bg-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(139,0,0,0.07),transparent)] pointer-events-none" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-medium mb-3">
            {t.howItWorks.subtitle}
          </p>
          <h2 className="font-cinzel font-bold text-4xl sm:text-5xl text-white">
            {t.howItWorks.title}
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-10 left-[calc(12.5%)] right-[calc(12.5%)] h-px bg-gradient-to-r from-transparent via-red-neon/30 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {t.howItWorks.steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                {/* Number circle */}
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-full border border-gold/30 bg-gold-dim/15 flex items-center justify-center">
                    <span className="font-cinzel font-black text-2xl text-gold">
                      {step.number}
                    </span>
                  </div>
                  {i < t.howItWorks.steps.length - 1 && (
                    <div className="md:hidden absolute top-1/2 left-full w-8 h-px bg-red-neon/20 -translate-y-1/2" />
                  )}
                </div>

                <h3 className="font-cinzel font-bold text-white text-base mb-2">
                  {step.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
