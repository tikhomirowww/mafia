"use client";

import { useRef, useState, useCallback } from "react";
import QRCode from "react-qr-code";
import { Upload, X, CheckCircle2, ImageIcon } from "lucide-react";

interface Props {
  amount: number;          // сом
  onFileChange: (file: File | null) => void;
}

export default function PaymentStep({ amount, onFileChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Placeholder QR value — replace with real mKassa/MBank QR URL when available
  const qrValue = `MAFIA_VIP_PAYMENT:${amount}:KGS`;

  const handleFile = useCallback((f: File | null) => {
    if (!f) { setPreview(null); onFileChange(null); return; }
    onFileChange(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, [onFileChange]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  return (
    <div className="space-y-5">
      {/* QR block */}
      <div className="bg-bg-primary border border-white/8 rounded-xl p-5">
        <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-4">
          Оплата предоплаты — <span className="text-gold font-bold">{amount.toLocaleString("ru-RU")} сом</span>
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* QR */}
          <div className="bg-white p-3 rounded-xl shrink-0">
            <QRCode value={qrValue} size={140} />
          </div>
          {/* Instructions */}
          <ol className="text-sm text-text-muted space-y-2.5 list-none">
            {[
              "Откройте приложение MBank или любой банк",
              "Нажмите «Оплата по QR-коду»",
              `Отсканируйте код и переведите ${amount.toLocaleString("ru-RU")} сом`,
              "Сделайте скриншот чека и загрузите ниже",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-neon/15 border border-red-neon/30 text-red-neon text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-4 text-[11px] text-text-dim text-center">
          ⚠️ QR-код — тестовая заглушка. Реквизиты будут обновлены перед запуском.
        </p>
      </div>

      {/* Receipt upload */}
      <div>
        <label className="block text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">
          Чек об оплате <span className="text-red-neon">*</span>
        </label>

        {preview ? (
          /* Preview */
          <div className="relative rounded-xl overflow-hidden border border-green-500/30 bg-bg-primary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Чек" className="w-full max-h-52 object-contain py-2" />
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 rounded-lg px-2.5 py-1.5">
              <CheckCircle2 size={13} className="text-green-400" />
              <span className="text-green-400 text-xs font-medium">Загружено</span>
            </div>
            <button
              type="button"
              onClick={() => handleFile(null)}
              className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-black/60 hover:bg-red-neon/80 flex items-center justify-center transition-colors"
              aria-label="Удалить"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        ) : (
          /* Drop zone */
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            className={[
              "border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200",
              dragOver
                ? "border-red-neon/60 bg-red-neon/5"
                : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]",
            ].join(" ")}
          >
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              {dragOver ? <Upload size={20} className="text-red-neon" /> : <ImageIcon size={20} className="text-text-dim" />}
            </div>
            <div className="text-center">
              <p className="text-sm text-white/70">Перетащите скриншот чека или <span className="text-red-neon">выберите файл</span></p>
              <p className="text-xs text-text-dim mt-1">PNG, JPG, WEBP — до 5 МБ</p>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}
