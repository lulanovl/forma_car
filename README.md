<div align="center">

# 🚗 FormaCar

**Цифровая система управления для премиальной автомойки**
Онлайн-запись для клиентов + CRM-панель для администратора — в одном приложении.

![Stack](https://img.shields.io/badge/Node.js-Express_4-339933?logo=node.js&logoColor=white)
![Stack](https://img.shields.io/badge/React_18-Vite_5-61DAFB?logo=react&logoColor=black)
![DB](https://img.shields.io/badge/SQLite_%2F_PostgreSQL-Knex.js-003B57?logo=sqlite&logoColor=white)
![Status](https://img.shields.io/badge/status-MVP_готов-success)

</div>

---

## Что это

FormaCar — готовый рабочий продукт для автомоек и детейлинг-студий Бишкека. Два режима в одном SPA:

1. **Клиентский сайт** — лендинг с услугами и формой онлайн-записи 24/7. Клиент сам выбирает услугу, тип кузова, дату и время; система показывает свободные слоты и считает цену.
2. **CRM-панель** — внутренняя система администратора: заказы, расписание, база клиентов с историей, финансовая аналитика, управление персоналом, прайс и чеклист качества для мастера.

---

## Возможности

| Модуль | Что делает |
|--------|-----------|
| 🗓️ **Онлайн-запись** | Выбор услуги, типа кузова, даты и времени. Максимум 6 машин на слот, атомарная защита от гонок. |
| 📋 **Заказы** | Карточки заказов с цветным статусом, WhatsApp-ссылки, действия (принять / в работу / чеклист). |
| 📅 **Расписание** | Визуальная загрузка по слотам, walk-in заказы вручную. |
| 👥 **База клиентов** | Автоагрегация по телефону, история визитов, поиск. |
| 📊 **Аналитика** | KPI-дашборд: выручка за день/неделю/месяц, средний чек, недельный график. |
| ✅ **Чеклист качества** | 28 пунктов из реального регламента, планшетный вид, автосохранение. |
| 💵 **Прайс** | Цены по типам кузова + доп. услуги, мгновенно на сайте. |
| 🔔 **Real-time** | SSE-уведомления о новых заявках без перезагрузки. |
| 📱 **Адаптив** | Лендинг и CRM работают на телефоне и планшете. |

---

## Стек

| Слой | Технологии |
|------|-----------|
| **Backend** | Node.js, Express 4, Knex.js, SQLite (dev) / PostgreSQL (prod) |
| **Frontend** | React 18 + Vite 5, чистый CSS (glassmorphism, без UI-фреймворков) |
| **Auth** | JWT (24ч), пароль администратора в env |
| **Real-time** | Server-Sent Events (`/api/events`) |
| **Безопасность** | helmet, express-rate-limit, CORS, секреты в env |

---

## Структура

```
FormaCar/
├── start.bat            # запуск backend + frontend одной командой (Windows)
├── api/                 # Vercel serverless-адаптер
├── backend/             # Express API, Knex migrations + seeds
│   └── src/
│       ├── app.js       # entry point (порт 3001)
│       ├── routes/      # auth, services, orders, slots, clients, staff, dashboard, checklist
│       ├── controllers/ # логика роутов
│       ├── middleware/  # JWT auth, errorHandler
│       └── db/          # knex, migrations (11), seeds (7)
├── frontend/            # React + Vite SPA
│   └── src/
│       ├── pages/site/  # лендинг (Hero, услуги, форма записи)
│       ├── pages/crm/   # Dashboard, Orders, Calendar, Clients, Staff, Prices, Checklist
│       ├── components/  # CalendarPicker, модалки, toast
│       └── api/         # fetch-обёртка + API-функции
└── context/             # проектная документация
```

---

## Запуск

**Требования:** Node.js 18+

```bash
# 1. Установка зависимостей
cd backend  && npm install
cd ../frontend && npm install

# 2. Настройка окружения
cp backend/.env.example backend/.env
#   задать ADMIN_PASSWORD и JWT_SECRET

# 3. Инициализация БД (миграции + сиды)
cd backend && npm run setup

# 4. Запуск
#   Windows — из корня:
start.bat
#   Или вручную (два терминала):
cd backend  && npm run dev   # → http://localhost:3001
cd frontend && npm run dev   # → http://localhost:5173
```

Открыть `http://localhost:5173`. Вход в CRM: кнопка **«⚙ Панель»** → пароль из `.env`.

---

## Деплой

- `vercel.json` — конфиг для Vercel (frontend build + serverless API).
- `render.yaml` — конфиг для Render (web service, PostgreSQL). Секреты (`ADMIN_PASSWORD`, `JWT_SECRET`) задаются в дашборде, не в коде.

---

## Дорожная карта

Полный список сделанного и запланированного — на [доске проекта](../../projects). Кратко:

**Готово:** REST API, JWT-auth, слоты с защитой от гонок, SSE, чеклист, дашборд, история клиентов, весь лендинг и CRM, мобильная адаптация, glassmorphism-редизайн, security-hardening.

**В планах:** Telegram-уведомления о заявках, фото в чеклисте, страница статуса заказа для клиента, расширенная аналитика, экспорт в Excel, продакшн-деплой на PostgreSQL, мульти-роли, drag-and-drop в расписании.

---

<div align="center">
<sub>FormaCar — built for carwashes & detailing studios in Bishkek.</sub>
</div>
