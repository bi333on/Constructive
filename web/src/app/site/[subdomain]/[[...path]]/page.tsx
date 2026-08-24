import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockList } from "@/components/BlockList";
import type { BlockInstance } from "@/blocks/types";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Params {
  subdomain: string;
  path?: string[];
}

interface PublishedRow {
  title: string;
  description: string;
  blocks: string;
}

type SiteData =
  | { kind: "missing" }
  | { kind: "notfound" }
  | { kind: "page"; title: string; description: string; blocks: BlockInstance[] };

const getSiteData = cache(
  async (subdomain: string, slug: string | null): Promise<SiteData> => {
    const db = getDb();
    const project = db
      .prepare("SELECT id FROM projects WHERE subdomain = ?")
      .get(subdomain) as unknown as { id: string } | undefined;
    if (!project) return { kind: "missing" };

    if (slug) {
      const row = db
        .prepare(
          `SELECT pp.title, pp.description, pp.blocks FROM published_pages pp
           JOIN pages p ON p.id = pp.page_id
           WHERE p.project_id = ? AND pp.slug = ?`,
        )
        .get(project.id, slug) as unknown as PublishedRow | undefined;
      if (!row) return { kind: "notfound" };
      return {
        kind: "page",
        title: row.title,
        description: row.description,
        blocks: JSON.parse(row.blocks) as BlockInstance[],
      };
    }

    // Главная страница — первая опубликованная в проекте.
    const row = db
      .prepare(
        `SELECT pp.title, pp.description, pp.blocks FROM published_pages pp
         JOIN pages p ON p.id = pp.page_id
         WHERE p.project_id = ?
         ORDER BY pp.published_at ASC LIMIT 1`,
      )
      .get(project.id) as unknown as PublishedRow | undefined;
    if (!row) {
      return { kind: "page", title: "", description: "", blocks: [] };
    }
    return {
      kind: "page",
      title: row.title,
      description: row.description,
      blocks: JSON.parse(row.blocks) as BlockInstance[],
    };
  },
);

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { subdomain, path } = await params;
  const data = await getSiteData(subdomain, path?.[0] ?? null);
  if (data.kind !== "page") return { title: "Страница не найдена" };
  return { title: data.title || subdomain, description: data.description };
}

export default async function SitePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { subdomain, path } = await params;
  const data = await getSiteData(subdomain, path?.[0] ?? null);
  if (data.kind !== "page") notFound();

  return (
    <main className="bg-white">
      {data.blocks.length === 0 ? (
        <div className="flex min-h-[60vh] items-center justify-center text-neutral-400">
          Сайт ещё не опубликован.
        </div>
      ) : (
        <BlockList blocks={data.blocks} />
      )}
    </main>
  );
}
