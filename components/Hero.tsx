"use client";

import { motion, type Variants } from "framer-motion";
import { ChevronDown, MapPin, Clock, Users, Star } from "lucide-react";
import { useLang } from "@/context/LangContext";
import ParticleCanvas from "@/components/ui/particle-canvas";

const STATS = [
  { icon: Star, key: "players" },
  { icon: MapPin, key: "locations" },
  { icon: Users, key: "group" },
  { icon: Clock, key: "schedule" },
] as const;

// Плавающие символы карт — рассыпаны по разным углам
const FLOATING_SUITS = [
  { suit: "♠", x: "8%",  y: "15%", size: 72,  delay: 0,    duration: 7,  opacity: 0.07 },
  { suit: "♥", x: "88%", y: "10%", size: 52,  delay: 1.2,  duration: 9,  opacity: 0.05 },
  { suit: "♦", x: "5%",  y: "72%", size: 44,  delay: 2.5,  duration: 8,  opacity: 0.06 },
  { suit: "♣", x: "91%", y: "65%", size: 64,  delay: 0.8,  duration: 11, opacity: 0.05 },
  { suit: "♠", x: "50%", y: "88%", size: 36,  delay: 3,    duration: 10, opacity: 0.04 },
  { suit: "♦", x: "75%", y: "80%", size: 28,  delay: 1.8,  duration: 6,  opacity: 0.06 },
];

const fadeUp = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: "easeOut" },
  },
});

export default function Hero() {
  const { t } = useLang();

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-dvh flex flex-col justify-center items-center overflow-hidden snap-section"
      aria-label="Главная секция"
    >
      {/* Particle canvas */}
      <ParticleCanvas
        color="rgba(220, 20, 60, 1)"
        lineColor="rgba(220, 20, 60, {o})"
        touchLineColor="rgba(255, 120, 120, {o})"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#0d0d0d]/78" />

      {/* Radial glow center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(139,0,0,0.18),transparent)]" />

      {/* Floating card suits — blurred, мелкие, рассыпаны */}
      {FLOATING_SUITS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute select-none pointer-events-none font-cinzel text-red-neon"
          style={{
            left: s.x,
            top: s.y,
            fontSize: s.size,
            opacity: s.opacity,
            filter: "blur(1.5px)",
            lineHeight: 1,
          }}
          animate={{ y: [0, -14, 0], rotate: [0, 4, -4, 0] }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        >
          {s.suit}
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-8 text-center pt-24 pb-16 flex flex-col items-center">

        {/* Badge */}
        <motion.div
          variants={fadeUp(0.3)}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 border border-gold/30 bg-black/40 rounded-full px-4 py-1.5 text-gold text-[11px] sm:text-xs font-medium uppercase tracking-widest mb-6 backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse shrink-0" />
          {t.hero.badge}
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={fadeUp(0.5)}
          initial="hidden"
          animate="visible"
          className="font-cinzel font-black text-[clamp(3.5rem,14vw,7rem)] tracking-tight text-white mb-3 glow-red leading-none"
        >
          {t.hero.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp(0.7)}
          initial="hidden"
          animate="visible"
          className="font-cinzel text-[clamp(1rem,3.5vw,1.6rem)] text-gold mb-4 px-2"
        >
          {t.hero.subtitle}
        </motion.p>

        {/* Description */}
        <motion.p
          variants={fadeUp(0.85)}
          initial="hidden"
          animate="visible"
          className="text-sm sm:text-base text-text-muted max-w-xl mx-auto mb-8 leading-relaxed"
        >
          {t.hero.description}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp(1.0)}
          initial="hidden"
          animate="visible"
          className="flex flex-col xs:flex-row gap-3 justify-center w-full max-w-sm sm:max-w-none mb-10"
        >
          <button
            onClick={() => scrollTo("#booking")}
            className="flex-1 sm:flex-none inline-flex items-center justify-center bg-gradient-to-r from-red-deep via-red-mid to-red-neon hover:brightness-110 active:scale-95 text-white font-bold text-sm sm:text-base px-7 py-3.5 sm:py-4 rounded-lg transition-all duration-200 uppercase tracking-widest shadow-lg shadow-red-deep/30"
          >
            {t.hero.cta} →
          </button>
          <button
            onClick={() => scrollTo("#services")}
            className="flex-1 sm:flex-none inline-flex items-center justify-center border border-gold/25 hover:border-gold/60 active:scale-95 text-text-muted hover:text-gold font-medium text-sm sm:text-base px-7 py-3.5 sm:py-4 rounded-lg transition-all duration-200 uppercase tracking-widest backdrop-blur-sm"
          >
            {t.hero.ctaSecondary}
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp(1.15)}
          initial="hidden"
          animate="visible"
          className="w-full grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 border border-white/8 rounded-xl overflow-hidden backdrop-blur-sm"
        >
          {STATS.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="bg-bg-card/60 flex flex-col items-center justify-center gap-1.5 py-4 sm:py-5 px-3"
            >
              <Icon size={18} className="text-gold" aria-hidden="true" />
              <span className="text-white font-bold text-sm sm:text-base font-cinzel text-center leading-tight">
                {t.hero.stats[key]}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() => scrollTo("#about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 text-text-dim hover:text-gold transition-colors duration-200 animate-bounce z-10"
        aria-label="Прокрутить вниз"
      >
        <ChevronDown size={26} />
      </motion.button>
    </section>
  );
}
