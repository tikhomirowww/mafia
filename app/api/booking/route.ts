import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

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

async function sendTelegramNotification(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

/** Upload base64 image to Google Drive, return public view URL */
async function uploadReceiptToDrive(
  auth: InstanceType<typeof google.auth.JWT>,
  base64: string,      // e.g. "data:image/png;base64,..."
  filename: string
): Promise<string> {
  const [meta, data] = base64.split(",");
  const mimeMatch = meta.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const buffer = Buffer.from(data, "base64");

  const drive = google.drive({ version: "v3", auth });

  const folderId = process.env.GOOGLE_DRIVE_RECEIPTS_FOLDER_ID; // optional

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType,
      ...(folderId ? { parents: [folderId] } : {}),
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id",
  });

  const fileId = res.data.id!;

  // Make file readable by anyone with link
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  return `https://drive.google.com/file/d/${fileId}/view`;
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

    // Double-booking check
    const slotsRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "BookedSlots!A:C",
    });
    const slotsRows = slotsRes.data.values ?? [];
    const slotKey = `${date}_${time}`;
    const alreadyBooked = slotsRows.some(
      (row) => row[0] === location && row[1] === slotKey
    );
    if (alreadyBooked) {
      return NextResponse.json({ error: "Slot already taken" }, { status: 409 });
    }

    const createdAt = new Date().toISOString();

    // Upload receipt to Drive if provided
    let receiptUrl = "";
    if (receipt && typeof receipt === "string" && receipt.startsWith("data:image")) {
      try {
        const filename = `receipt_${name}_${date}_${time}.jpg`.replace(/[^a-zA-Z0-9._-]/g, "_");
        receiptUrl = await uploadReceiptToDrive(auth, receipt, filename);
      } catch (e) {
        console.error("Drive upload failed:", e);
        // Non-fatal — continue booking
      }
    }

    // Write to Bookings sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Bookings!A:J",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          createdAt, format ?? "", location, date, time,
          name, phone, players, comment ?? "", receiptUrl,
        ]],
      },
    });

    // Write to BookedSlots sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "BookedSlots!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[location, slotKey, createdAt]] },
    });

    // Telegram notification
    const locationName =
      location === "yunusaliev" ? "ул. Юнусалиева 129" : "пр. Шабдан Баатыра 4а";
    const receiptLine = receiptUrl ? `\n🧾 <b>Чек:</b> <a href="${receiptUrl}">открыть</a>` : "";

    await sendTelegramNotification(
      `🎴 <b>Новая бронь — Mafia VIP</b>\n\n` +
      `📍 <b>Зал:</b> ${locationName}\n` +
      `📅 <b>Дата:</b> ${date}\n` +
      `⏰ <b>Время:</b> ${time}\n` +
      `🎭 <b>Формат:</b> ${format || "—"}\n` +
      `👤 <b>Имя:</b> ${name}\n` +
      `📱 <b>Телефон:</b> ${phone}\n` +
      `👥 <b>Игроков:</b> ${players}\n` +
      `💬 <b>Комментарий:</b> ${comment || "—"}` +
      receiptLine +
      `\n\n🕐 <i>${createdAt}</i>`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
