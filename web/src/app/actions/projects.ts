"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-session";
import { getDb, newId } from "@/lib/db";
import { slugify } from "@/lib/utils";

export interface ProjectRow {
  id: string;
  name: string;
  subdomain: string | null;
  page_count: number;
}

export async function listProjects(): Promise<{
  projects?: ProjectRow[];
  error?: string;
}> {
  const user = await requireUser();
  const rows = getDb()
    .prepare(
      `SELECT p.id, p.name, p.subdomain,
         (SELECT COUNT(*) FROM pages pg WHERE pg.project_id = p.id) AS page_count
       FROM projects p
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
    )
    .all(user.id) as unknown as ProjectRow[];
  // Приводим к обычным объектам (SQLite возвращает null-прототипы).
  return {
    projects: rows.map((r) => ({
      id: r.id,
      name: r.name,
      subdomain: r.subdomain,
      page_count: r.page_count,
    })),
  };
}

export async function createProject(name: string): Promise<{
  error?: string;
  id?: string;
}> {
  const user = await requireUser();
  const trimmed = name.trim() || "Новый сайт";
  const base = slugify(trimmed);

  const db = getDb();
  let subdomain = base;
  let i = 2;
  while (db.prepare("SELECT id FROM projects WHERE subdomain = ?").get(subdomain)) {
    subdomain = `${base}-${i++}`;
  }

  const id = newId();
  db.prepare(
    "INSERT INTO projects (id, user_id, name, subdomain) VALUES (?, ?, ?, ?)",
  ).run(id, user.id, trimmed, subdomain);

  revalidatePath("/dashboard");
  return { id };
}

export async function renameProject(
  id: string,
  name: string,
): Promise<{ error?: string }> {
  const user = await requireUser();
  getDb()
    .prepare("UPDATE projects SET name = ? WHERE id = ? AND user_id = ?")
    .run(name.trim() || "Сайт", id, user.id);
  revalidatePath("/dashboard");
  return {};
}

export async function deleteProject(id: string): Promise<{ error?: string }> {
  const user = await requireUser();
  const db = getDb();

  const pageIds = db
    .prepare("SELECT id FROM pages WHERE project_id = ? AND user_id = ?")
    .all(id, user.id) as unknown as { id: string }[];

  for (const p of pageIds) {
    db.prepare("DELETE FROM published_pages WHERE page_id = ?").run(p.id);
    db.prepare("DELETE FROM page_versions WHERE page_id = ?").run(p.id);
  }
  db.prepare("DELETE FROM pages WHERE project_id = ? AND user_id = ?").run(id, user.id);
  db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").run(id, user.id);

  revalidatePath("/dashboard");
  return {};
}
