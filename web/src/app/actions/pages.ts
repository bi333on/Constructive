"use server";

import { revalidatePath } from "next/cache";
import type { BlockInstance, PageData } from "@/blocks/types";
import { getDb, newId } from "@/lib/db";
import { slugify } from "@/lib/utils";

export interface SavePageInput {
  id?: string;
  title: string;
  slug: string;
  description: string;
  blocks: BlockInstance[];
}

export type ActionResult = {
  error?: string;
  id?: string;
  slug?: string;
  page?: PageData;
};

interface PageRow {
  id: string;
  title: string;
  slug: string | null;
  description: string;
  blocks: string;
  published: number;
  updated_at: string;
}

function rowToPage(row: PageRow): PageData {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug ?? "",
    description: row.description,
    blocks: (JSON.parse(row.blocks) as BlockInstance[]) ?? [],
  };
}

export async function getPage(id: string): Promise<ActionResult> {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM pages WHERE id = ?")
    .get(id) as unknown as PageRow | undefined;
  if (!row) return { error: "Страница не найдена" };
  return { page: rowToPage(row) };
}

export async function createPage(): Promise<ActionResult> {
  const db = getDb();
  const id = newId();
  db.prepare(
    "INSERT INTO pages (id, title) VALUES (?, 'Новая страница')",
  ).run(id);
  revalidatePath("/dashboard");
  return { id };
}

export async function savePage(input: SavePageInput): Promise<ActionResult> {
  const db = getDb();
  const slug = input.slug || slugify(input.title);
  const blocksJson = JSON.stringify(input.blocks ?? []);
  const now = new Date().toISOString();

  let pageId = input.id;
  if (pageId) {
    const res = db
      .prepare(
        "UPDATE pages SET title = ?, slug = ?, description = ?, blocks = ?, updated_at = ? WHERE id = ?",
      )
      .run(input.title, slug, input.description, blocksJson, now, pageId);
    if (res.changes === 0) return { error: "Страница не найдена" };
  } else {
    pageId = newId();
    db.prepare(
      "INSERT INTO pages (id, title, slug, description, blocks, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(pageId, input.title, slug, input.description, blocksJson, now);
  }

  // Версия для истории изменений.
  db.prepare(
    "INSERT INTO page_versions (id, page_id, title, blocks) VALUES (?, ?, ?, ?)",
  ).run(newId(), pageId, input.title, blocksJson);

  return { id: pageId, slug };
}

export async function publishPage(pageId: string): Promise<ActionResult> {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM pages WHERE id = ?")
    .get(pageId) as unknown as PageRow | undefined;
  if (!row) return { error: "Страница не найдена" };

  const slug = row.slug || slugify(row.title);
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO published_pages (page_id, slug, title, description, blocks, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(page_id) DO UPDATE SET
       slug = excluded.slug,
       title = excluded.title,
       description = excluded.description,
       blocks = excluded.blocks,
       updated_at = excluded.updated_at`,
  ).run(pageId, slug, row.title, row.description, row.blocks, now);

  db.prepare(
    "UPDATE pages SET slug = ?, published = 1, updated_at = ? WHERE id = ?",
  ).run(slug, now, pageId);

  revalidatePath(`/p/${slug}`);
  revalidatePath("/dashboard");
  return { slug };
}

export async function unpublishPage(pageId: string): Promise<ActionResult> {
  const db = getDb();
  db.prepare("DELETE FROM published_pages WHERE page_id = ?").run(pageId);
  db.prepare("UPDATE pages SET published = 0 WHERE id = ?").run(pageId);
  revalidatePath("/dashboard");
  return {};
}

export async function deletePage(pageId: string): Promise<ActionResult> {
  const db = getDb();
  db.prepare("DELETE FROM published_pages WHERE page_id = ?").run(pageId);
  db.prepare("DELETE FROM page_versions WHERE page_id = ?").run(pageId);
  db.prepare("DELETE FROM pages WHERE id = ?").run(pageId);
  revalidatePath("/dashboard");
  return {};
}
