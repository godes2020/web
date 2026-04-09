# Скульптор Лица - Текущее состояние проекта

## Общее описание

Образовательная платформа (EdTech) для онлайн-курсов по косметологии/уходу за лицом от Анны Артемьевой. Проект состоит из двух частей: фронтенд на Next.js и бэкенд на Node.js + Express + PostgreSQL.

---

## Backend (`/backend`)

**Стек:** Node.js, Express, PostgreSQL, JavaScript (не TypeScript)

### Структура

```
backend/
├── src/
│   ├── index.js                  — Точка входа (порт 4000)
│   ├── app.js                    — Конфигурация Express
│   ├── db/
│   │   ├── index.js              — Пул соединений PostgreSQL
│   │   └── migrations/
│   │       ├── 001_init.sql      — Таблицы users, auth_tokens
│   │       ├── 002_password_reset.sql — Таблица reset_tokens, поле password_hash
│   │       └── 003_email_codes.sql   — Таблица email_codes, поле is_verified
│   ├── middleware/
│   │   └── auth.js               — JWT-авторизация (requireAuth)
│   ├── routes/
│   │   ├── auth.js               — 7 эндпоинтов аутентификации
│   │   └── user.js               — 4 эндпоинта профиля
│   ├── services/
│   │   ├── email.js              — Отправка писем через Nodemailer
│   │   └── token.js              — Генерация/верификация токенов
│   └── utils/
│       └── jwt.js                — JWT sign/verify
├── public/avatars/               — Хранение аватаров
├── package.json
└── .env.example
```

### API-эндпоинты

#### Аутентификация (`/api/auth/`)

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| POST | `/api/auth/register/send-code` | Отправка 6-значного кода на email |
| POST | `/api/auth/register/verify` | Верификация кода и создание аккаунта |
| POST | `/api/auth/login` | Вход по email + пароль |
| POST | `/api/auth/email/send` | Отправка magic link |
| POST | `/api/auth/email/verify` | Верификация magic link |
| POST | `/api/auth/password/forgot` | Запрос сброса пароля |
| POST | `/api/auth/password/reset` | Сброс пароля по токену |

#### Пользователь (`/api/`)

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/me` | Получение профиля |
| PATCH | `/api/me` | Обновление имени |
| POST | `/api/me/avatar` | Загрузка аватара (multipart) |
| PATCH | `/api/me/password` | Смена пароля |
| GET | `/api/health` | Health check |

### База данных (PostgreSQL)

4 таблицы:
- **users** — id, email, name, avatar_url, password_hash, is_verified, created_at, updated_at
- **auth_tokens** — magic link токены (срок действия 24 часа)
- **reset_tokens** — токены сброса пароля (срок действия 1 час)
- **email_codes** — 6-значные коды верификации (срок действия 10 минут)

### Безопасность

- Хеширование паролей: bcrypt (12 раундов)
- JWT-аутентификация (HS256, TTL 30 дней)
- Rate limiting: 10 запросов за 10 минут на auth-эндпоинтах
- Helmet (security headers)
- CORS ограничен URL фронтенда
- Одноразовые токены (помечаются used_at)

### Live-трансляции (Feature: Step 1 — выполнено)

Реализован RTMP-сервер с транскодингом в HLS (`backend/src/services/stream.js`):

- **node-media-server** принимает RTMP поток от OBS на порту `RTMP_PORT` (по умолчанию 1935)
- Валидация `STREAM_KEY` на событии `prePublish` — неверный ключ отключается немедленно
- **FFmpeg** запускается автоматически при старте трансляции, транскодирует RTMP → HLS
- HLS сегменты (`.m3u8` + `.ts`) пишутся в `backend/media/live/`
- Старые сегменты очищаются при старте/останове трансляции
- Параметры HLS: сегменты по 4 сек, список из 6 сегментов, автоудаление старых (`delete_segments`)

Переменные окружения: `STREAM_KEY`, `RTMP_PORT`

**Ветка:** `feature/step-1-rtmp-hls` (запушена в origin)

**Step 2 — выполнено** (`feature/step-2-hls-status`):
- `/hls/*` — раздача HLS-сегментов из `media/live` с правильными MIME-типами (`.m3u8`, `.ts`)
- `GET /api/status` → `{ online: boolean, startedAt: string | null }`
- Состояние трансляции отслеживается в `stream.js` (`streamOnline`, `streamStartedAt`)

**Step 3 — выполнено** (`feature/step-3-websocket`):
- socket.io подключён к Express через `http.createServer`
- При подключении клиент сразу получает текущий `stream:status`
- `stream:status { online, startedAt }` рассылается всем при старте/стопе трансляции
- `chat:message` принимается от клиента и рассылается всем с полями `name`, `text`, `time`

**Следующий шаг (Step 4):** React компонент `VideoPlayer` на hls.js — подключается к `.m3u8` когда стрим онлайн, показывает заглушку когда офлайн. Статус через `useStream` хук.

### Зависимости

express, cors, helmet, dotenv, jsonwebtoken, bcryptjs, pg, nodemailer, multer, express-rate-limit, nodemon (dev), node-media-server, fluent-ffmpeg

---

## Frontend (`/skulptorlitsa`)

**Стек:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand, TanStack React Query

### Страницы и маршруты

| Маршрут | Описание |
|---------|----------|
| `/` | Главная (герой, курсы, отзывы, блог) |
| `/about` | Об Анне Артемьевой |
| `/blog` | Список статей |
| `/blog/[slug]` | Статья блога |
| `/courses` | Каталог курсов + FAQ |
| `/courses/[id]` | Детали курса |
| `/courses/[id]/learn` | Обучение (видеоплеер + уроки) |
| `/masterclasses` | Мастер-классы |
| `/reviews` | Отзывы |
| `/streams/[id]` | Прямые эфиры / записи с чатом |
| `/dashboard` | Личный кабинет (защищенный) |
| `/profile` | Настройки профиля (защищенный) |
| `/privacy` | Политика конфиденциальности |
| `/login` | Вход / Регистрация |
| `/auth/vk/callback` | OAuth VK callback |
| `/auth/email/verify` | Подтверждение email |
| `/auth/password/reset` | Сброс пароля |

### Компоненты

**Layout:** Header (sticky навигация, мобильное меню), Footer

**UI-компоненты:**
- Button — варианты (primary, secondary, vk, ghost, danger), размеры (sm, md, lg)
- CourseCard — карточка курса (изображение, цена, длительность)
- Modal — портал с закрытием по Escape
- RevealSection — анимация появления при скролле (Intersection Observer)
- SectionTitle — заголовок секции
- SkeletonCard — скелетон загрузки
- Toast — уведомления (success, error, info)
- Icons — SVG иконки

**Shared-компоненты:**
- ChatBox — чат для стримов (Socket.IO ready)
- CountdownTimer — таймер обратного отсчета
- HlsPlayer — HLS видеоплеер (hls.js)

**Feature-компоненты:**
- ApplicationForm — форма заявки на курс (Zod валидация)
- PainCards — карточки "боли" клиента

### Управление состоянием

**Zustand Store (authStore):**
- user, isAuthenticated, isLoading
- login/logout/initFromStorage
- JWT хранится в localStorage

**TanStack React Query:**
- Настроен провайдер (stale time: 5 мин, 1 retry)
- Инфраструктура готова для API-запросов

### API-интеграция

**Axios инстанс:**
- Base URL: `NEXT_PUBLIC_API_URL` (по умолчанию `https://api.skulptorlitsa.ru/api`)
- Timeout: 10 секунд
- Автоматическое добавление JWT токена в заголовки
- Перехват 401 ошибок с редиректом на `/login`

### Дизайн-система

**Цветовая палитра:**
- Primary: `#33783e` (зеленый)
- Gold: `#bf9244`
- Cream: `#ead4a1`
- Milk: `#f0e9d6`
- Accent red: `#a3212a`

**Шрифт:** Open Sans (400, 600, 700, 800)

**Адаптивность:** Mobile-first, брейкпоинты sm/md/lg, мобильное гамбургер-меню

### Особые возможности

- **Аутентификация:** JWT + OAuth VK, OTP верификация, сброс пароля
- **Видео-стриминг:** HLS.js, поддержка Safari, тестовые стримы Mux
- **Реальное время:** Socket.IO для чата во время стримов
- **Анимации:** Intersection Observer для reveal-эффектов, fade-up/fade-right
- **Валидация форм:** Zod + React Hook Form (телефон +7, email, пароль)
- **Уведомления:** Toast-система (авто-закрытие через 4 сек)
- **SEO:** Next.js Metadata API, OpenGraph (ru_RU), robots indexing
- **Язык интерфейса:** Русский

### Моковые данные (`lib/mockData.ts`)

- 3 курса с модулями и ценами
- Стримы (предстоящие/завершенные)
- Отзывы с рейтингами
- Статьи блога с тегами
- Мастер-классы
- Доступы пользователя к курсам

### Зависимости

react, react-dom, next, axios, zustand, @tanstack/react-query, react-hook-form, zod, socket.io-client, hls.js, date-fns, tailwindcss, typescript, eslint

---

## Что реализовано (итого)

### Готово:
1. Полная система аутентификации (регистрация, вход, magic link, сброс пароля, OAuth VK)
2. Бэкенд с REST API (11 эндпоинтов)
3. База данных PostgreSQL с 4 таблицами и 3 миграциями
4. Email-сервис (Nodemailer) с HTML-шаблонами
5. Фронтенд с 15+ страницами и навигацией
6. Адаптивный дизайн с кастомной дизайн-системой
7. Компоненты UI (кнопки, карточки, модалки, тосты, скелетоны)
8. HLS видеоплеер для стримов и курсов
9. Чат для прямых эфиров (Socket.IO)
10. Формы с валидацией (Zod + React Hook Form)
11. Zustand store для авторизации
12. Axios клиент с интерцепторами
13. Rate limiting и security headers
14. Загрузка аватаров (multer)
15. Моковые данные для разработки
16. RTMP-сервер + HLS транскодинг (node-media-server + FFmpeg) — Step 1
17. HLS раздача `/hls/*` + `GET /api/status` — Step 2
18. WebSocket (socket.io): `stream:status` + `chat:message` — Step 3

### Не реализовано / требует доработки:
1. API для курсов, стримов, блога, мастер-классов, отзывов (бэкенд)
2. Система оплаты
3. Панель администратора
4. WebSocket сервер (Socket.IO на бэкенде) — Step 3
5. Загрузка и управление видео-контентом
6. Реальная интеграция с VK OAuth на бэкенде
7. Автоматический запуск миграций
8. CI/CD и деплой
9. Тесты
10. React VideoPlayer + useStream хук — Step 4
11. React LiveChat — Step 5
11. React VideoPlayer + LiveChat — Steps 4–5
