import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

// Локальная SQLite (встроенный модуль Node.js) — без внешних сервисов.
// Файл БД: data/builder.db (или путь из env DATABASE_PATH).

const SCHEMA = `
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Новая страница',
  slug TEXT,
  description TEXT NOT NULL DEFAULT '',
  blocks TEXT NOT NULL DEFAULT '[]',
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS page_versions (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  title TEXT NOT NULL,
  blocks TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS published_pages (
  page_id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  blocks TEXT NOT NULL,
  published_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

function createDatabase(): DatabaseSync {
  const dbPath =
    process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "builder.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  return db;
}

const globalForDb = globalThis as unknown as { __builderDb?: DatabaseSync };

export function getDb(): DatabaseSync {
  if (!globalForDb.__builderDb) {
    globalForDb.__builderDb = createDatabase();
  }
  return globalForDb.__builderDb;
}

export function newId(): string {
  return crypto.randomUUID();
}
