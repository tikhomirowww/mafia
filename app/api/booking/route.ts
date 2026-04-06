import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

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
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { location, date, time, name, phone, players, comment } = body;

    // Basic validation
    if (!location || !date || !time || !name || !phone || !players) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (players < 8 || players > 14) {
      return NextResponse.json({ error: "Invalid player count" }, { status: 400 });
    }

    // Check 2-hour advance requirement
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

    // Check double booking in BookedSlots sheet
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

    // Write to Bookings sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Bookings!A:H",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[createdAt, location, date, time, name, phone, players, comment ?? ""]],
      },
    });

    // Write to BookedSlots sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "BookedSlots!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[location, slotKey, createdAt]],
      },
    });

    // Send Telegram notification
    const locationName =
      location === "yunusaliev"
        ? "ул. Юнусалиева 129"
        : "пр. Шабдан Баатыра 4а";

    await sendTelegramNotification(
      `🎴 <b>Новая бронь — Mafia VIP</b>\n\n` +
        `📍 <b>Зал:</b> ${locationName}\n` +
        `📅 <b>Дата:</b> ${date}\n` +
        `⏰ <b>Время:</b> ${time}\n` +
        `👤 <b>Имя:</b> ${name}\n` +
        `📱 <b>Телефон:</b> ${phone}\n` +
        `👥 <b>Игроков:</b> ${players}\n` +
        `💬 <b>Комментарий:</b> ${comment || "—"}\n\n` +
        `🕐 <i>${createdAt}</i>`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
