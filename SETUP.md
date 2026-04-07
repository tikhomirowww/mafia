# Инструкция по настройке интеграций — Mafia VIP

---

## 1. Google Cloud Project + Service Account

**Создать проект:**
1. Открой [console.cloud.google.com](https://console.cloud.google.com)
2. Сверху → **Select a project** → **New Project** → любое название → **Create**

**Включить API:**
1. **APIs & Services → Library**
2. Найди и включи **Google Sheets API** → Enable
3. Найди и включи **Google Drive API** → Enable

**Создать Service Account:**
1. **APIs & Services → Credentials → Create Credentials → Service Account**
2. Придумай имя (например `mafia-vip-bot`) → **Create and Continue → Done**
3. Нажми на созданный аккаунт → вкладка **Keys → Add Key → Create new key → JSON → Create**
4. Скачается файл `*.json` — из него нужны два поля:
   - `client_email` → это `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → это `GOOGLE_PRIVATE_KEY`

---

## 2. Google Sheets

1. Открой [sheets.google.com](https://sheets.google.com) → создай новую таблицу
2. Назови её как угодно (например `Mafia VIP — Брони`)
3. Скопируй ID из URL: `docs.google.com/spreadsheets/d/`**`ВОТ_ЭТО`**`/edit`
4. Нажми **Поделиться** → вставь `client_email` сервисного аккаунта → роль **Редактор**

> Листы `Bookings` и `BookedSlots` с заголовками создадутся **автоматически** при первой брони.

---

## 3. Telegram Bot

1. Напиши [@BotFather](https://t.me/BotFather) → `/newbot`
2. Придумай название (например `Mafia VIP Admin`) и username (оканчивается на `bot`)
3. BotFather выдаст токен — это `TELEGRAM_BOT_TOKEN`

**Получить Chat ID:**
1. Создай группу и добавь в неё бота
2. Напиши в группе любое сообщение
3. Открой в браузере:
   ```
   https://api.telegram.org/bot<ТОКЕН>/getUpdates
   ```
4. Найди `"chat":{"id": -1009876543210}` — это `TELEGRAM_CHAT_ID`

> Используй именно **группу**, а не личку с ботом — тогда будут работать ссылки на чеки `t.me/c/...`

---

## 4. Файл `.env.local`

```env
# Google Sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=mafia-vip-bot@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms

# Telegram
TELEGRAM_BOT_TOKEN=7123456789:AAF_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_CHAT_ID=-1001234567890
```

> `GOOGLE_PRIVATE_KEY` — вставляй **со всеми переносами** как есть из JSON-файла, в кавычках. Переносы строк должны быть `\n` (не реальные переносы).

---

## 5. Деплой на Vercel

1. Запушь код на GitHub
2. Зайди на [vercel.com](https://vercel.com) → **New Project** → выбери репозиторий
3. **Settings → Environment Variables** → добавь все переменные из `.env.local`
4. **Deploy**

> После деплоя добавь продакшн-домен в [Google Search Console](https://search.google.com/search-console) и отправь sitemap: `https://твой-домен/sitemap.xml`

---

## Проверка что всё работает

- [ ] Создай тестовую бронь с чеком
- [ ] В Telegram пришло уведомление с данными и фото чека
- [ ] В Google Sheets появилась строка с корректными данными и ссылкой на чек
- [ ] Повторная бронь на тот же слот выдаёт ошибку «Слот занят»

