import { cache } from "react";
import type { BlockInstance } from "@/blocks/types";
import { getDb } from "@/lib/db";

export interface PublishedPageData {
  slug: string;
  title: string;
  description: string;
  blocks: BlockInstance[];
}

interface PublishedRow {
  slug: string;
  title: string;
  description: string;
  blocks: string;
}

/** Публичная страница по slug (кэшируется в рамках запроса). */
export const getPublishedPage = cache(
  async (slug: string): Promise<PublishedPageData | null> => {
    const db = getDb();
    const row = db
      .prepare(
        "SELECT slug, title, description, blocks FROM published_pages WHERE slug = ?",
      )
      .get(slug) as unknown as PublishedRow | undefined;
    if (!row) return null;
    return {
      slug: row.slug,
      title: row.title,
      description: row.description,
      blocks: JSON.parse(row.blocks) as BlockInstance[],
    };
  },
);
