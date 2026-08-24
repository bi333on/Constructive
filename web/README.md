# Конструктор сайтов — веб-приложение

Блочный drag-and-drop конструктор сайтов (аналог Tilda) на **Next.js 16 + TypeScript + Tailwind CSS**.

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

База данных SQLite создаётся автоматически в `data/builder.db`.

## Скрипты

```bash
npm run dev      # режим разработки
npm run build    # production-сборка
npm run start    # запуск собранного приложения
npm run lint     # проверка ESLint
```

## Структура

- `src/blocks/` — система блоков: типы, схемы (`definitions.ts`), компоненты рендера и реестр (`registry.tsx`).
- `src/editor/` — редактор: store (zustand + zundo), канвас с drag-and-drop, панель настроек, тулбар, предпросмотр.
- `src/app/actions/pages.ts` — серверные действия (создание/сохранение/публикация страниц).
- `src/app/p/[slug]/` — публичный рендер опубликованной страницы.
- `src/app/dashboard/` — дашборд страниц.
- `src/lib/db.ts` — SQLite (встроенный `node:sqlite`).

## Стек

- Next.js 16 (App Router, Turbopack), React 19, TypeScript.
- Tailwind CSS 4, dnd-kit (drag-and-drop), zustand + zundo (состояние и undo/redo).
- SQLite через `node:sqlite` (без внешних сервисов).

## Деплой

Инструкция по развёртыванию на VPS (Ubuntu 24.04, Caddy) — в [`../deploy/README.md`](../deploy/README.md).
