"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useLang } from "@/context/LangContext";
import SectionBg from "@/components/ui/section-bg";

export default function Testimonials() {
  const { t } = useLang();

  return (
    <section id="reviews" className="py-24 bg-bg-primary relative overflow-hidden snap-section">
      <SectionBg variant="subtle" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-medium mb-3">
            {t.testimonials.subtitle}
          </p>
          <h2 className="font-cinzel font-bold text-4xl sm:text-5xl text-white">
            {t.testimonials.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.testimonials.items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group bg-bg-card border border-white/5 hover:border-red-neon/20 rounded-xl p-6 flex flex-col gap-4 transition-colors duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1" aria-label={`Оценка: ${item.rating} из 5`}>
                {Array.from({ length: item.rating }).map((_, s) => (
                  <Star
                    key={s}
                    size={14}
                    className="text-gold fill-gold"
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-white/80 text-sm leading-relaxed flex-1">
                &ldquo;{item.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <div className="w-8 h-8 rounded-full bg-gold-dim/30 border border-gold/20 flex items-center justify-center text-xs font-cinzel font-bold text-gold">
                  {item.name[0]}
                </div>
                <span className="text-white text-sm font-medium">{item.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
