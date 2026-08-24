import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { openDatabase } from "./db";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "builder-db-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("openDatabase", () => {
  it("создаёт схему и поддерживает запись/чтение", () => {
    const db = openDatabase(path.join(dir, "test.db"));

    db.prepare(
      "INSERT INTO pages (id, title, slug, description, blocks) VALUES (?, ?, ?, ?, ?)",
    ).run("1", "Тест", "test", "", JSON.stringify([{ id: "b1", type: "text", props: {} }]));

    const row = db
      .prepare("SELECT title, blocks FROM pages WHERE id = ?")
      .get("1") as { title: string; blocks: string };

    expect(row.title).toBe("Тест");
    expect(JSON.parse(row.blocks)).toHaveLength(1);
  });

  it("публикация пишет снимок в published_pages", () => {
    const db = openDatabase(path.join(dir, "test.db"));

    db.prepare(
      "INSERT INTO pages (id, title, slug, description, blocks) VALUES (?, ?, ?, ?, ?)",
    ).run("1", "Тест", "test", "", "[]");

    db.prepare(
      `INSERT INTO published_pages (page_id, slug, title, description, blocks)
       VALUES (?, ?, ?, ?, ?)`,
    ).run("1", "test", "Тест", "", "[]");

    const published = db
      .prepare("SELECT slug FROM published_pages WHERE slug = ?")
      .get("test") as { slug: string };
    expect(published.slug).toBe("test");
  });
});
