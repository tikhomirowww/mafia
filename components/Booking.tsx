"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, AlertCircle, Loader2, PlusCircle } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { useBooking } from "@/context/BookingContext";
import { LOCATIONS, CONTACTS } from "@/lib/site-config";
import SectionBg from "@/components/ui/section-bg";
import CustomSelect from "@/components/ui/custom-select";
import CustomDatePicker from "@/components/ui/custom-datepicker";
import DrumTimePicker from "@/components/ui/drum-time-picker";
import PhoneInput from "@/components/ui/phone-input";
import PaymentStep from "@/components/ui/payment-step";

// Valid KG mobile prefixes (3 digits after +996):
// Beeline: 700-709, 770-779 | MegaCom: 500-509, 550-559 | O!: 200-209, 220-229, 990-999 | Saima: 300-309
const KG_PREFIX_RE = /^\+996(20[0-9]|22[0-9]|30[0-9]|50[0-9]|55[0-9]|70[0-9]|77[0-9]|99[0-9])\d{6}$/;

const schema = z.object({
  format: z.string().min(1),
  location: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  name: z.string().min(2),
  phone: z.string().min(13).regex(KG_PREFIX_RE),
  players: z.number().min(8).max(14),
  comment: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface SlotStatus {
  [key: string]: "booked" | "past";
}

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00", "23:00", "00:00", "01:00",
  "02:00", "03:00", "04:00", "05:00", "06:00", "07:00",
];

function isSlotPast(date: string, time: string): boolean {
  const now = new Date();
  const [h, m] = time.split(":").map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(h, m ?? 0, 0, 0);
  return slotDate.getTime() - now.getTime() < 2 * 60 * 60 * 1000;
}

const FORMAT_OPTIONS = {
  ru: [
    { value: "adult", label: "Взрослая Мафия" },
    { value: "kids", label: "Детская Мафия" },
    { value: "corporate", label: "Корпоратив" },
    { value: "certificate", label: "Подарочный сертификат" },
  ],
  ky: [
    { value: "adult", label: "Чоңдор үчүн Мафия" },
    { value: "kids", label: "Балдар үчүн Мафия" },
    { value: "corporate", label: "Корпоратив" },
    { value: "certificate", label: "Белек сертификаты" },
  ],
};

export default function Booking() {
  const { t, lang } = useLang();
  const { selectedFormat } = useBooking();
  const b = t.booking;

  const [bookedSlots, setBookedSlots] = useState<SlotStatus>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { players: 8 },
  });

  const handleNewBooking = useCallback(() => {
    reset({ players: 8 });
    setReceiptFile(null);
    setServerError("");
    setReceiptError("");
    setSubmitted(false);
  }, [reset]);

  const selectedDate = watch("date");
  const selectedLocation = watch("location");
  const selectedTime = watch("time");
  const selectedPlayers = watch("players");
  const selectedFormatField = watch("format");

  // Pre-select format from BookingContext (set by Services cards)
  useEffect(() => {
    if (selectedFormat) {
      setValue("format", selectedFormat);
    }
  }, [selectedFormat, setValue]);

  // Fetch booked slots when date or location changes
  useEffect(() => {
    if (!selectedDate || !selectedLocation) return;
    setLoadingSlots(true);
    fetch(`/api/slots?date=${selectedDate}&location=${selectedLocation}`)
      .then((r) => r.json())
      .then((data) => setBookedSlots(data.slots ?? {}))
      .catch(() => setBookedSlots({}))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedLocation]);

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setReceiptError("");
    if (isSlotPast(data.date, data.time)) {
      setServerError(b.errors.tooSoon);
      return;
    }
    const slotKey = `${data.date}_${data.time}`;
    if (bookedSlots[slotKey] === "booked") {
      setServerError(b.errors.slotTaken);
      return;
    }
    if (!receiptFile) {
      setReceiptError(b.errors.receiptRequired);
      return;
    }

    // Convert receipt to base64
    let receiptBase64: string | undefined;
    if (receiptFile) {
      receiptBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(receiptFile);
      });
    }

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, receipt: receiptBase64 }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setServerError(b.errors.generic);
    }
  };

  // For today: strip past slots (≥2h rule). For future dates: all 24 slots.
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const drumSlots = useMemo(() => {
    if (!selectedDate) return TIME_SLOTS;
    if (selectedDate === todayStr) {
      return TIME_SLOTS.filter((slot) => !isSlotPast(selectedDate, slot));
    }
    return TIME_SLOTS;
  }, [selectedDate, todayStr]);

  // Reset time when date changes and current value is no longer in drum
  useEffect(() => {
    if (selectedTime && !drumSlots.includes(selectedTime)) {
      setValue("time", "");
    }
  }, [drumSlots, selectedTime, setValue]);

  const getDrumStatus = (time: string): "available" | "booked" => {
    const key = `${selectedDate}_${time}`;
    if (bookedSlots[key] === "booked") return "booked";
    return "available";
  };

  const locationOptions = LOCATIONS.map((loc) => ({
    value: loc.id,
    label: `${lang === "ru" ? loc.name_ru : loc.name_ky} — ${lang === "ru" ? loc.hint_ru : loc.hint_ky}`,
  }));

  const formatOptions = FORMAT_OPTIONS[lang];

  return (
    <section id="booking" className="py-24 relative bg-bg-primary overflow-hidden">
      <SectionBg variant="red" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-red-neon text-xs uppercase tracking-[0.3em] font-medium mb-3">
            {b.subtitle}
          </p>
          <h2 className="font-cinzel font-bold text-4xl sm:text-5xl text-white">
            {b.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 bg-bg-card border border-white/5 rounded-xl p-6 sm:p-8"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-12 gap-5"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <h3 className="font-cinzel font-bold text-white text-2xl">
                    {b.success.title}
                  </h3>
                  <p className="text-text-muted text-sm max-w-sm leading-relaxed">
                    {b.success.description}
                  </p>
                  <button
                    type="button"
                    onClick={handleNewBooking}
                    className="mt-2 inline-flex items-center gap-2 bg-red-neon hover:bg-red-mid text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 uppercase tracking-wider text-sm"
                  >
                    <PlusCircle size={16} />
                    {b.success.newBooking}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                  noValidate
                >
                  {/* Format */}
                  <div>
                    <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">
                      {b.form.format} <span className="text-red-neon">*</span>
                    </label>
                    <Controller
                      name="format"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          options={formatOptions}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder={b.form.formatPlaceholder}
                        />
                      )}
                    />
                    {errors.format && (
                      <p className="text-red-neon text-xs mt-1">{b.errors.required}</p>
                    )}
                  </div>

                  {/* Location — shown after format selected */}
                  {selectedFormatField && (
                    <div>
                      <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">
                        {b.form.location} <span className="text-red-neon">*</span>
                      </label>
                      <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                          <CustomSelect
                            options={locationOptions}
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder={b.form.locationPlaceholder}
                          />
                        )}
                      />
                      {errors.location && (
                        <p className="text-red-neon text-xs mt-1">{b.errors.required}</p>
                      )}
                    </div>
                  )}

                  {/* Date — shown after location selected */}
                  {selectedLocation && (
                    <div>
                      <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">
                        {b.form.date} <span className="text-red-neon">*</span>
                      </label>
                      <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                          <CustomDatePicker
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder="Выберите дату"
                          />
                        )}
                      />
                      {errors.date && (
                        <p className="text-red-neon text-xs mt-1">{b.errors.required}</p>
                      )}
                    </div>
                  )}

                  {/* Time slots — drum picker */}
                  {selectedDate && (
                    <div>
                      <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">
                        {b.form.time} <span className="text-red-neon">*</span>
                      </label>
                      {loadingSlots ? (
                        <div className="flex items-center gap-2 text-text-muted text-sm py-3">
                          <Loader2 size={14} className="animate-spin" />
                          <span>Загрузка слотов...</span>
                        </div>
                      ) : drumSlots.length === 0 ? (
                        <div className="rounded-xl bg-bg-elevated border border-white/8 px-5 py-6 text-center">
                          <p className="text-text-muted text-sm">
                            На сегодня доступных слотов нет.
                          </p>
                          <p className="text-text-dim text-xs mt-1">
                            Выберите другую дату или напишите нам в{" "}
                            <a href={CONTACTS.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-red-neon hover:underline">
                              WhatsApp
                            </a>
                          </p>
                        </div>
                      ) : (
                        <DrumTimePicker
                          slots={drumSlots}
                          value={selectedTime ?? ""}
                          onChange={(v) => setValue("time", v, { shouldValidate: true })}
                          getStatus={getDrumStatus}
                        />
                      )}
                      {errors.time && (
                        <p className="text-red-neon text-xs mt-1">{b.errors.required}</p>
                      )}
                    </div>
                  )}

                  {/* Name + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">
                        {b.form.name} <span className="text-red-neon">*</span>
                      </label>
                      <input
                        type="text"
                        {...register("name")}
                        placeholder={b.form.namePlaceholder}
                        className="w-full bg-bg-elevated border border-white/10 hover:border-white/20 focus:border-red-neon text-white placeholder:text-text-dim rounded-lg px-4 py-3 text-sm transition-colors duration-200 outline-none"
                      />
                      {errors.name && (
                        <p className="text-red-neon text-xs mt-1">{b.errors.required}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">
                        {b.form.phone} <span className="text-red-neon">*</span>
                      </label>
                      <PhoneInput
                        value={watch("phone") ?? ""}
                        onChange={(v) => setValue("phone", v, { shouldValidate: true })}
                        hasError={!!errors.phone}
                      />
                      {errors.phone && (
                        <p className="text-red-neon text-xs mt-1">{b.errors.phoneInvalid}</p>
                      )}
                    </div>
                  </div>

                  {/* Players */}
                  <div>
                    <label className="block text-xs text-text-muted uppercase tracking-wider font-medium mb-2">
                      {b.form.players} <span className="text-red-neon">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Stepper row */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const v = watch("players");
                            if (v > 8) setValue("players", v - 1);
                          }}
                          className="w-10 h-10 rounded-lg border border-white/10 text-white hover:border-red-neon/50 flex items-center justify-center text-xl transition-colors duration-200 shrink-0"
                          aria-label="Уменьшить"
                        >
                          −
                        </button>
                        <div className="w-16 bg-bg-elevated border border-white/10 text-white text-center rounded-lg px-3 py-2.5 text-sm shrink-0 select-none font-medium tabular-nums">
                          {selectedPlayers}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const v = watch("players");
                            if (v < 14) setValue("players", v + 1);
                          }}
                          className="w-10 h-10 rounded-lg border border-white/10 text-white hover:border-red-neon/50 flex items-center justify-center text-xl transition-colors duration-200 shrink-0"
                          aria-label="Увеличить"
                        >
                          +
                        </button>
                        <span className="text-text-muted text-xs shrink-0">(8–14)</span>
                      </div>
                      {/* Cost — full width on mobile, fills remaining on desktop */}
                      {selectedFormatField === "adult" ? (
                        <div className="flex-1 flex items-center justify-between bg-bg-primary border border-white/6 rounded-lg px-4 py-2.5">
                          <span className="text-text-muted text-xs tabular-nums">{selectedPlayers} × 400 сом</span>
                          <span className="text-gold font-bold text-base tabular-nums font-cinzel">
                            {(selectedPlayers * 400).toLocaleString("ru-RU")}
                            <span className="text-gold/60 text-xs font-normal ml-1">сом/час</span>
                          </span>
                        </div>
                      ) : selectedFormatField ? (
                        <div className="flex-1 flex items-center justify-center bg-bg-primary border border-white/6 rounded-lg px-4 py-2.5">
                          <span className="text-xs text-text-dim">
                            {lang === "ru" ? "Цена по договорённости" : "Баа макулдашуу боюнча"}
                          </span>
                        </div>
                      ) : null}
                    </div>
                    {errors.players && (
                      <p className="text-red-neon text-xs mt-1">
                        {errors.players.type === "too_small"
                          ? b.errors.minPlayers
                          : b.errors.maxPlayers}
                      </p>
                    )}
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">
                      {b.form.comment}
                    </label>
                    <textarea
                      {...register("comment")}
                      placeholder={b.form.commentPlaceholder}
                      rows={3}
                      className="w-full bg-bg-elevated border border-white/10 hover:border-white/20 focus:border-red-neon text-white placeholder:text-text-dim rounded-lg px-4 py-3 text-sm transition-colors duration-200 outline-none resize-none"
                    />
                  </div>

                  {/* Server error */}
                  {serverError && (
                    <div className="flex items-center gap-2 bg-red-deep/20 border border-red-neon/30 rounded-lg px-4 py-3 text-red-neon text-sm">
                      <AlertCircle size={16} aria-hidden="true" />
                      {serverError}
                    </div>
                  )}

                  {/* Payment */}
                  {selectedFormatField && (
                    <PaymentStep
                      amount={1000}
                      onFileChange={(f) => { setReceiptFile(f); if (f) setReceiptError(""); }}
                      error={receiptError}
                    />
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-neon hover:bg-red-mid disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-colors duration-200 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {isSubmitting ? b.form.submitting : b.form.submit}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Conditions sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1 space-y-4"
          >
            <div className="bg-bg-card border border-red-neon/20 rounded-xl p-6">
              <h3 className="font-cinzel font-semibold text-white text-sm uppercase tracking-wider mb-4">
                {b.conditions.title}
              </h3>
              <ul className="space-y-3">
                {b.conditions.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-text-muted">
                    <span className="text-red-neon mt-0.5 flex-shrink-0">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>


            <a
              href={CONTACTS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-white/10 hover:border-red-neon/50 text-text-muted hover:text-white py-3.5 rounded-xl text-sm transition-all duration-200 uppercase tracking-wider"
            >
              Написать в WhatsApp
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
