"use client";

import { motion } from "framer-motion";
import { Shield, Armchair, Users, Clock, MapPin, Baby } from "lucide-react";
import { useLang } from "@/context/LangContext";

const ICONS = [Shield, Armchair, Users, Clock, MapPin, Baby];

export default function About() {
  const { t } = useLang();

  return (
    <section id="about" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_20%_50%,rgba(139,0,0,0.06),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_80%_80%,rgba(201,168,76,0.04),transparent)] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-medium mb-3">
            Mafia VIP
          </p>
          <h2 className="font-cinzel font-bold text-4xl sm:text-5xl text-white mb-4">
            {t.about.title}
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            {t.about.subtitle}
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.about.features.map((feature, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative bg-gradient-to-b from-bg-elevated/50 to-bg-card border border-white/5 hover:border-gold/20 rounded-xl p-6 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gold-dim/30 border border-gold/15 flex items-center justify-center group-hover:bg-gold-dim/50 transition-colors duration-300">
                    <Icon size={18} className="text-gold" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-cinzel font-semibold text-white text-base mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Hover line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
