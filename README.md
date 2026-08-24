# Конструктор сайтов (аналог Tilda)

Блочный drag-and-drop конструктор сайтов на **Next.js 16 + TypeScript + Tailwind CSS**.
Данные хранятся в **локальной SQLite** (встроенный `node:sqlite`) — без внешних сервисов.

## Возможности
- 10 стартовых блоков (обложка, преимущества, галерея, тарифы, FAQ и др.).
- Drag-and-drop канвас, панель настроек, undo/redo, горячие клавиши.
- Адаптивный предпросмотр (компьютер / планшет / телефон).
- Автосохранение в SQLite, публикация страниц по адресу `/p/<slug>`.
- Дашборд страниц (`/dashboard`): создание, редактирование, публикация, удаление.

## Локальный запуск
```bash
cd web
npm install
npm run dev
# откройте http://localhost:3000
```
БД создаётся автоматически в `web/data/builder.db`.

## Деплой на VPS (Ubuntu 24.04)
Подробная автоустановка в [`deploy/README.md`](deploy/README.md).

Коротко:
```bash
git clone https://github.com/bi333on/Constructive.git
cd Constructive
sudo ./deploy/install.sh example.com you@example.com
```

## Структура
- `web/` — приложение Next.js.
- `deploy/` — автоустановка (systemd + Nginx + Let's Encrypt).
- `supabase/migrations/` — SQL-схема (заготовка для будущего перехода на Postgres/Supabase).
