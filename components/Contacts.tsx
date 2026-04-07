"use client";

import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import WhatsAppIcon from "@/components/ui/whatsapp-icon";
import { useLang } from "@/context/LangContext";
import { CONTACTS, LOCATIONS } from "@/lib/site-config";
import SectionBg from "@/components/ui/section-bg";

export default function Contacts() {
  const { t, lang } = useLang();
  const c = t.contacts;

  return (
    <section id="contacts" className="py-24 bg-bg-primary relative overflow-hidden">
      <SectionBg variant="gold" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-medium mb-3">
            {c.subtitle}
          </p>
          <h2 className="font-cinzel font-bold text-4xl sm:text-5xl text-white mb-3">
            {c.title}
          </h2>
          <p className="text-text-muted">{c.schedule}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Maps */}
          {LOCATIONS.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-bg-card border border-white/5 rounded-xl overflow-hidden"
            >
              <div className="aspect-video">
                <iframe
                  src={loc.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={lang === "ru" ? loc.name_ru : loc.name_ky}
                />
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-red-neon mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-white font-medium text-sm">
                      {lang === "ru" ? loc.name_ru : loc.name_ky}
                    </p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {lang === "ru" ? loc.hint_ru : loc.hint_ky}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-bg-card border border-white/5 rounded-xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3 py-4 border-b border-white/5">
              <Clock size={18} className="text-red-neon" aria-hidden="true" />
              <div>
                <p className="text-white text-sm font-medium">24/7</p>
                <p className="text-text-muted text-xs">Без выходных</p>
              </div>
            </div>

            <a
              href={CONTACTS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-4 border-b border-white/5 hover:text-red-neon transition-colors duration-200 group"
            >
              <span className="group-hover:scale-110 transition-transform duration-200 inline-flex">
                <WhatsAppIcon size={18} />
              </span>
              <div>
                <p className="text-white text-sm font-medium">{c.whatsapp}</p>
                <p className="text-text-muted text-xs">+996 709 899 998</p>
              </div>
            </a>

            <a
              href={CONTACTS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-4 hover:text-red-neon transition-colors duration-200 group"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-neon group-hover:scale-110 transition-transform duration-200"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              <div>
                <p className="text-white text-sm font-medium">{c.instagram}</p>
                <p className="text-text-muted text-xs">{CONTACTS.instagram_handle}</p>
              </div>
            </a>

            <div className="mt-auto">
              <a
                href={CONTACTS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-red-neon hover:bg-red-mid text-white font-bold py-3.5 rounded-lg transition-colors duration-200 uppercase tracking-wider text-sm"
              >
                {t.common.bookNow}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
