import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// Increase body size limit for base64 receipt images (up to 10MB)
export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

function getAuth() {
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key,
    scopes: SCOPES,
  });
}

const BOOKINGS_HEADERS = [
  "Дата создания", "Формат", "Зал", "Дата", "Время",       // A–E
  "Имя", "Телефон", "Игроков", "Комментарий", "Чек",       // F–J
  "Оплата ✓", "Предоплата", "Скидка 50%",                  // K–M
  "Полная сумма", "Остаток",                                // N–O
  "_ключ",                                                   // P
];

/**
 * Ensure both sheets exist and have headers.
 * Returns the numeric sheetId of the Bookings sheet (needed for batchUpdate).
 */
async function ensureSheets(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string
): Promise<number> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetMeta = meta.data.sheets ?? [];
  const existing = sheetMeta.map((s) => s.properties?.title ?? "");

  const toCreate: string[] = [];
  if (!existing.includes("Bookings")) toCreate.push("Bookings");

  if (toCreate.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: toCreate.map((title) => ({
          addSheet: { properties: { title } },
        })),
      },
    });
  }

  // Re-fetch only if we created new sheets
  const freshMeta = toCreate.length > 0
    ? (await sheets.spreadsheets.get({ spreadsheetId })).data.sheets ?? []
    : sheetMeta;

  const bookingsSheetId =
    freshMeta.find((s) => s.properties?.title === "Bookings")
      ?.properties?.sheetId ?? 0;

  // Add headers only when first row is empty
  const addHeaderIfEmpty = async (sheet: string, headers: string[]): Promise<boolean> => {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheet}!A1:Z1`,
    });
    if (!res.data.values || res.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheet}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [headers] },
      });
      return true;
    }
    return false;
  };

  const wasEmpty = await addHeaderIfEmpty("Bookings", BOOKINGS_HEADERS);

  // Style header row only when freshly created
  if (wasEmpty) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          repeatCell: {
            range: {
              sheetId: bookingsSheetId,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.13, green: 0.13, blue: 0.13 },
                textFormat: {
                  bold: true,
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 10,
                },
                horizontalAlignment: "CENTER",
                verticalAlignment: "MIDDLE",
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
          },
        }, {
          // Freeze header row
          updateSheetProperties: {
            properties: { sheetId: bookingsSheetId, gridProperties: { frozenRowCount: 1 } },
            fields: "gridProperties.frozenRowCount",
          },
        }],
      },
    });
  }

  return bookingsSheetId;
}

/** Apply checkbox (Boolean) data validation to a single cell in column L. */

async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

/**
 * Send receipt image to Telegram as a photo.
 * Returns a link to the message (for storing in Sheets), or null on failure.
 */
async function sendReceiptToTelegram(base64: string, caption: string): Promise<string | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;

  const [meta, data] = base64.split(",");
  const mimeMatch = meta.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const ext = mimeType.split("/")[1] ?? "jpg";
  const buffer = Buffer.from(data, "base64");

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("caption", caption);
  form.append("photo", new Blob([buffer], { type: mimeType }), `receipt.${ext}`);

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: form,
  });

  const json = await res.json() as { ok: boolean; result?: { message_id: number } };
  if (!json.ok || !json.result) return null;

  const messageId = json.result.message_id;
  // Build deep link: for group/supergroup chats, chatId starts with -100
  const numericId = chatId.replace(/^-100/, "");
  return `https://t.me/c/${numericId}/${messageId}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { format, location, date, time, name, phone, players, comment, receipt } = body;

    if (!location || !date || !time || !name || !phone || !players) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (players < 8 || players > 14) {
      return NextResponse.json({ error: "Invalid player count" }, { status: 400 });
    }
    const KG_PREFIX_RE = /^\+996(20[0-9]|22[0-9]|30[0-9]|50[0-9]|55[0-9]|70[0-9]|77[0-9]|99[0-9])\d{6}$/;
    if (!KG_PREFIX_RE.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    // 2-hour advance check
    const now = new Date();
    const [h, m] = time.split(":").map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(h, m ?? 0, 0, 0);
    if (slotDate.getTime() - now.getTime() < 2 * 60 * 60 * 1000) {
      return NextResponse.json({ error: "Too soon" }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const bookingsSheetId = await ensureSheets(sheets, spreadsheetId);

    // Read columns G (Телефон), M (Скидка) and P (_ключ) in parallel
    const [phonesRes, discountRes, slotsRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: "Bookings!G:G" }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: "Bookings!M:M" }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: "Bookings!P:P" }),
    ]);

    // Double-booking check
    const slotKey = `${date}_${time}`;
    const fullKey = `${location}_${slotKey}`;
    const alreadyBooked = (slotsRes.data.values ?? []).some(
      (row) => row[0] === fullKey
    );
    if (alreadyBooked) {
      return NextResponse.json({ error: "Slot already taken" }, { status: 409 });
    }

    // Determine discount: count visits since the last discount for this phone.
    // If that count + 1 reaches 6 — this visit gets a discount.
    const phoneRaw = phone.startsWith("+") ? phone : `+${phone}`;
    const phones = phonesRes.data.values ?? [];
    const discounts = discountRes.data.values ?? [];

    // Find indices of rows matching this phone (1-based rows → 0-based array index)
    // Row 0 in array = header, skip it
    let visitsSinceLastDiscount = 0;

    for (let i = 1; i < phones.length; i++) {
      if (phones[i]?.[0] === phoneRaw) {
        const discountVal = discounts[i]?.[0];
        if (discountVal === true || discountVal === "TRUE") {
          visitsSinceLastDiscount = 0; // сброс счётчика от последней скидки
        } else {
          visitsSinceLastDiscount++;
        }
      }
    }

    // This new booking is the (visitsSinceLastDiscount + 1)-th visit since last discount
    const isDiscountVisit = (visitsSinceLastDiscount + 1) === 6;

    const hasReceipt = receipt && typeof receipt === "string" && receipt.startsWith("data:image");

    const FORMAT_LABELS: Record<string, string> = {
      adult:       "Взрослая Мафия",
      kids:        "Детская Мафия",
      corporate:   "Корпоратив",
      certificate: "Подарочный сертификат",
    };
    const LOCATION_LABELS: Record<string, string> = {
      yunusaliev: "ул. Юнусалиева 129",
      shabdan:    "пр. Шабдан Баатыра 4а",
    };

    const formatRu = FORMAT_LABELS[format] ?? format ?? "";
    const locationRu = LOCATION_LABELS[location] ?? location;
    // Wrap in formula so Google Sheets doesn't strip the leading "+"
    const phoneDisplay = `="${phoneRaw}"`;

    const toRuDate = (d: Date) =>
      d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bishkek" });
    const toRuDateTime = (d: Date) =>
      d.toLocaleString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bishkek" });

    const nowDate = new Date();
    const gameDateDisplay = toRuDate(new Date(`${date}T12:00:00`));
    const createdAtDisplay = toRuDateTime(nowDate);


    // Send receipt to Telegram first — we need the message link for Sheets
    let receiptTgLink: string | null = null;
    if (hasReceipt) {
      receiptTgLink = await sendReceiptToTelegram(
        receipt,
        `Чек от ${name} — ${gameDateDisplay} ${time} (${locationRu})`
      ).catch((e) => { console.error("Receipt Telegram send failed:", e); return null; });
    }

    const receiptCell = receiptTgLink
      ? `=HYPERLINK("${receiptTgLink}";"Открыть в Telegram")`
      : hasReceipt ? "Чек (ссылка недоступна)" : "Нет";

    // Write to Bookings sheet
    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Bookings!A:P",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          createdAtDisplay, formatRu, locationRu, gameDateDisplay, time,
          name, phoneDisplay, players, comment ?? "",
          receiptCell,
          false,             // K: Оплата ✓ (checkbox)
          1000,              // L: Предоплата (всегда 1000)
          isDiscountVisit,   // M: Скидка 50% (bool, кликабельный чекбокс)
          0,                 // N: Полная сумма (overwritten by formula)
          0,                 // O: Остаток (overwritten by formula)
          `${location}_${slotKey}`, // P: _ключ
        ]],
      },
    });

    // Apply formulas + checkbox validation to the row we just wrote
    const updatedRange = appendRes.data.updates?.updatedRange ?? "";
    const rowMatch = updatedRange.match(/(\d+)$/);
    if (rowMatch) {
      const row = parseInt(rowMatch[1]); // 1-based sheet row
      const rowIndex = row - 1;          // 0-based for batchUpdate

      // Write formulas for N (Полная сумма) and O (Остаток)
      // M (Скидка) — кликабельный чекбокс, N и O пересчитываются при его изменении
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Bookings!N${row}:O${row}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            // N: Полная сумма — игроки × 400, со скидкой ÷ 2 (только Взрослая Мафия)
            `=IF(B${row}="Взрослая Мафия";IF(M${row};H${row}*400/2;H${row}*400);"")`,
            // O: Остаток — Полная сумма минус предоплата
            `=IF(ISNUMBER(N${row});N${row}-L${row};"")`,
          ]],
        },
      }).catch((e) => console.error("Formula write failed:", e));

      // Checkbox validation on K (Оплата ✓) and M (Скидка 50%)
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              setDataValidation: {
                range: { sheetId: bookingsSheetId, startRowIndex: rowIndex, endRowIndex: row, startColumnIndex: 10, endColumnIndex: 11 },
                rule: { condition: { type: "BOOLEAN" }, strict: true, showCustomUi: true },
              },
            },
            {
              setDataValidation: {
                range: { sheetId: bookingsSheetId, startRowIndex: rowIndex, endRowIndex: row, startColumnIndex: 12, endColumnIndex: 13 },
                rule: { condition: { type: "BOOLEAN" }, strict: true, showCustomUi: true },
              },
            },
          ],
        },
      }).catch((e) => console.error("Checkbox validation failed:", e));
    }

    // Telegram: main notification
    await sendTelegramMessage(
      `🎴 <b>Новая бронь — Mafia VIP</b>\n\n` +
      `📍 <b>Зал:</b> ${locationRu}\n` +
      `📅 <b>Дата:</b> ${gameDateDisplay}\n` +
      `⏰ <b>Время:</b> ${time}\n` +
      `🎭 <b>Формат:</b> ${formatRu || "—"}\n` +
      `👤 <b>Имя:</b> ${name}\n` +
      `📱 <b>Телефон:</b> ${phoneRaw}\n` +
      `👥 <b>Игроков:</b> ${players}\n` +
      `💬 <b>Комментарий:</b> ${comment || "—"}` +
      (receiptTgLink ? `\n🧾 <b>Чек:</b> <a href="${receiptTgLink}">открыть</a>` : hasReceipt ? "\n🧾 <b>Чек:</b> (ссылка недоступна)" : "") +
      `\n\n🕐 <i>${createdAtDisplay}</i>`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
