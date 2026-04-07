import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

function getAuth() {
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key,
    scopes: SCOPES,
  });
}

// Cache slots for 30 seconds to reduce Sheets API calls
const cache = new Map<string, { data: Record<string, "booked">; ts: number }>();
const CACHE_TTL = 30_000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const location = searchParams.get("location");

  if (!date || !location) {
    return NextResponse.json({ slots: {} });
  }

  const cacheKey = `${date}_${location}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ slots: cached.data });
  }

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) {
    return NextResponse.json({ slots: {} });
  }

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // Read column P (_ключ) from Bookings: "location_date_time"
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Bookings!P:P",
    });

    const rows = res.data.values ?? [];
    const slots: Record<string, "booked"> = {};
    const prefix = `${location}_${date}_`;

    for (const row of rows) {
      const key = row[0] as string | undefined;
      if (key?.startsWith(prefix)) {
        // key = "yunusaliev_2026-04-07_11:00" → slotKey = "2026-04-07_11:00"
        const slotKey = key.slice(location.length + 1);
        slots[slotKey] = "booked";
      }
    }

    cache.set(cacheKey, { data: slots, ts: Date.now() });

    return NextResponse.json({ slots });
  } catch (err) {
    console.error("Slots fetch error:", err);
    return NextResponse.json({ slots: {} });
  }
}
