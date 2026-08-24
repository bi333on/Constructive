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
  project_id TEXT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  blocks TEXT NOT NULL,
  published_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

function ensureColumn(
  db: DatabaseSync,
  table: string,
  column: string,
  definition: string,
) {
  const cols = db
    .prepare(`PRAGMA table_info(${table})`)
    .all() as unknown as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

/** Открывает (и при необходимости создаёт) БД по указанному пути. */
export function openDatabase(dbPath: string): DatabaseSync {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);

  // Миграция: добавляем владельца к страницам (для уже существующих БД).
  ensureColumn(db, "pages", "user_id", "TEXT");
  db.exec(
    "CREATE INDEX IF NOT EXISTS pages_user_id_idx ON pages(user_id);",
  );

  // Миграция: привязка страниц к проектам.
  ensureColumn(db, "pages", "project_id", "TEXT");
  db.exec(
    "CREATE INDEX IF NOT EXISTS pages_project_id_idx ON pages(project_id);",
  );

  // Миграция: собственный домен проекта.
  ensureColumn(db, "projects", "domain", "TEXT");

  // Миграция: published_pages v2 — slug уникален в рамках проекта (а не глобально).
  migratePublishedPages(db);
  return db;
}

function migratePublishedPages(db: DatabaseSync) {
  const cols = db
    .prepare("PRAGMA table_info(published_pages)")
    .all() as unknown as { name: string }[];
  if (!cols.some((c) => c.name === "project_id")) {
    db.exec(`
      ALTER TABLE published_pages RENAME TO published_pages_old;
      CREATE TABLE published_pages (
        page_id TEXT PRIMARY KEY,
        project_id TEXT,
        slug TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        blocks TEXT NOT NULL,
        published_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO published_pages (page_id, project_id, slug, title, description, blocks, published_at, updated_at)
        SELECT pp.page_id, p.project_id, pp.slug, pp.title, pp.description, pp.blocks, pp.published_at, pp.updated_at
        FROM published_pages_old pp
        LEFT JOIN pages p ON p.id = pp.page_id;
      DROP TABLE published_pages_old;
    `);
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS published_pages_project_slug_idx
      ON published_pages(project_id, slug);
    CREATE INDEX IF NOT EXISTS published_pages_slug_idx
      ON published_pages(slug);
  `);
}

const globalForDb = globalThis as unknown as { __builderDb?: DatabaseSync };

export function getDb(): DatabaseSync {
  if (!globalForDb.__builderDb) {
    const dbPath =
      process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "builder.db");
    globalForDb.__builderDb = openDatabase(dbPath);
  }
  return globalForDb.__builderDb;
}

export function newId(): string {
  return crypto.randomUUID();
}
