"use server";

import { revalidatePath } from "next/cache";
import type { BlockInstance, PageData } from "@/blocks/types";
import { requireUser } from "@/lib/auth-session";
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

/** Возвращает страницу, принадлежащую текущему пользователю (или null). */
function ownPage(db: ReturnType<typeof getDb>, userId: string, pageId: string) {
  return db
    .prepare("SELECT * FROM pages WHERE id = ? AND user_id = ?")
    .get(pageId, userId) as unknown as PageRow | undefined;
}

export async function getPage(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const row = ownPage(getDb(), user.id, id);
  if (!row) return { error: "Страница не найдена" };
  return { page: rowToPage(row) };
}

export async function createPage(projectId?: string): Promise<ActionResult> {
  const user = await requireUser();
  const db = getDb();
  const id = newId();
  db.prepare(
    "INSERT INTO pages (id, title, user_id, project_id) VALUES (?, 'Новая страница', ?, ?)",
  ).run(id, user.id, projectId ?? null);
  revalidatePath("/dashboard");
  return { id };
}

export interface PageListItem {
  id: string;
  title: string;
  slug: string | null;
  published: boolean;
  updated_at: string;
}

export async function listPages(
  projectId: string,
): Promise<ActionResult & { pages?: PageListItem[] }> {
  const user = await requireUser();
  const rows = getDb()
    .prepare(
      "SELECT id, title, slug, published, updated_at FROM pages WHERE project_id = ? AND user_id = ? ORDER BY updated_at DESC",
    )
    .all(projectId, user.id) as unknown as {
    id: string;
    title: string;
    slug: string | null;
    published: number;
    updated_at: string;
  }[];

  return {
    pages: rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      published: !!r.published,
      updated_at: r.updated_at,
    })),
  };
}

export async function savePage(input: SavePageInput): Promise<ActionResult> {
  const user = await requireUser();
  const db = getDb();
  const slug = input.slug || slugify(input.title);
  const blocksJson = JSON.stringify(input.blocks ?? []);
  const now = new Date().toISOString();

  let pageId = input.id;
  if (pageId) {
    const res = db
      .prepare(
        "UPDATE pages SET title = ?, slug = ?, description = ?, blocks = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      )
      .run(input.title, slug, input.description, blocksJson, now, pageId, user.id);
    if (res.changes === 0) return { error: "Страница не найдена" };
  } else {
    pageId = newId();
    db.prepare(
      "INSERT INTO pages (id, title, slug, description, blocks, updated_at, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ).run(pageId, input.title, slug, input.description, blocksJson, now, user.id);
  }

  // Версия для истории изменений (пропускаем, если содержимое не изменилось).
  const last = db
    .prepare(
      "SELECT title, blocks FROM page_versions WHERE page_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 1",
    )
    .get(pageId) as unknown as { title: string; blocks: string } | undefined;
  if (!last || last.blocks !== blocksJson || last.title !== input.title) {
    db.prepare(
      "INSERT INTO page_versions (id, page_id, title, blocks) VALUES (?, ?, ?, ?)",
    ).run(newId(), pageId, input.title, blocksJson);
  }

  return { id: pageId, slug };
}

export async function publishPage(pageId: string): Promise<ActionResult> {
  const user = await requireUser();
  const row = ownPage(getDb(), user.id, pageId);
  if (!row) return { error: "Страница не найдена" };

  const db = getDb();
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
  const user = await requireUser();
  if (!ownPage(getDb(), user.id, pageId)) return { error: "Страница не найдена" };

  const db = getDb();
  db.prepare("DELETE FROM published_pages WHERE page_id = ?").run(pageId);
  db.prepare("UPDATE pages SET published = 0 WHERE id = ?").run(pageId);
  revalidatePath("/dashboard");
  return {};
}

export async function deletePage(pageId: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!ownPage(getDb(), user.id, pageId)) return { error: "Страница не найдена" };

  const db = getDb();
  db.prepare("DELETE FROM published_pages WHERE page_id = ?").run(pageId);
  db.prepare("DELETE FROM page_versions WHERE page_id = ?").run(pageId);
  db.prepare("DELETE FROM pages WHERE id = ?").run(pageId);
  revalidatePath("/dashboard");
  return {};
}

export interface PageVersion {
  id: string;
  title: string;
  created_at: string;
}

export async function listVersions(
  pageId: string,
): Promise<ActionResult & { versions?: PageVersion[] }> {
  const user = await requireUser();
  if (!ownPage(getDb(), user.id, pageId)) return { error: "Страница не найдена" };

  const rows = getDb()
    .prepare(
      "SELECT id, title, created_at FROM page_versions WHERE page_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 50",
    )
    .all(pageId) as unknown as PageVersion[];
  return {
    versions: rows.map((r) => ({
      id: r.id,
      title: r.title,
      created_at: r.created_at,
    })),
  };
}

export async function getVersion(
  versionId: string,
): Promise<
  ActionResult & { version?: { title: string; blocks: BlockInstance[] } }
> {
  const user = await requireUser();
  const db = getDb();
  const row = db
    .prepare(
      `SELECT v.title, v.blocks FROM page_versions v
       JOIN pages p ON p.id = v.page_id
       WHERE v.id = ? AND p.user_id = ?`,
    )
    .get(versionId, user.id) as unknown as
    | { title: string; blocks: string }
    | undefined;
  if (!row) return { error: "Версия не найдена" };
  return {
    version: { title: row.title, blocks: JSON.parse(row.blocks) as BlockInstance[] },
  };
}
