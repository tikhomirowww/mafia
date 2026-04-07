"use client";

import { motion } from "framer-motion";
import WhatsAppIcon from "@/components/ui/whatsapp-icon";
import { useLang } from "@/context/LangContext";
import { CONTACTS } from "@/lib/site-config";

export default function Footer() {
  const { t } = useLang();
  const f = t.footer;

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[#080808] border-t border-white/5">
      {/* CTA strip */}
      <div className="border-b border-white/5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 text-center"
        >
          <h2 className="font-cinzel font-bold text-3xl sm:text-4xl text-white mb-4">
            {f.cta}
          </h2>
          <p className="text-text-muted mb-7">{f.tagline}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => scrollTo("#booking")}
              className="inline-flex items-center justify-center bg-red-neon hover:bg-red-mid text-white font-bold px-8 py-3.5 rounded-lg transition-colors duration-200 uppercase tracking-widest text-sm glow-red-box"
            >
              {f.ctaButton}
            </button>
            <a
              href={CONTACTS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-red-neon/40 text-white hover:text-red-neon px-8 py-3.5 rounded-lg transition-colors duration-200 text-sm uppercase tracking-wider"
            >
              <WhatsAppIcon size={16} />
              WhatsApp
            </a>
          </div>
        </motion.div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Logo + rights */}
          <div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="font-cinzel font-black text-2xl text-white tracking-widest hover:text-red-neon transition-colors duration-200 mb-2 block"
            >
              MAFIA<span className="text-red-neon">.</span>VIP
            </button>
            <p className="text-text-dim text-xs">{f.rights}</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-6" aria-label="Нижняя навигация">
            {[
              { href: "#about", label: f.links.about },
              { href: "#booking", label: f.links.booking },
              { href: "#faq", label: f.links.faq },
              { href: "#contacts", label: f.links.contacts },
            ].map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-text-muted hover:text-white text-sm transition-colors duration-200 uppercase tracking-wider cursor-pointer"
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Social */}
          <div className="flex items-center gap-3">
            <a
              href={CONTACTS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg border border-white/10 hover:border-red-neon/50 flex items-center justify-center text-text-muted hover:text-red-neon transition-all duration-200"
              aria-label="Instagram Mafia VIP"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a
              href={CONTACTS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg border border-white/10 hover:border-red-neon/50 flex items-center justify-center text-text-muted hover:text-red-neon transition-all duration-200"
              aria-label="WhatsApp Mafia VIP"
            >
              <WhatsAppIcon size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
