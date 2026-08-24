import { getDb } from "@/lib/db";
import {
  DashboardClient,
  type DashboardPageRow,
} from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  title: string;
  slug: string | null;
  published: number;
  updated_at: string;
}

export default function DashboardPage() {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, title, slug, published, updated_at FROM pages ORDER BY updated_at DESC",
    )
    .all() as unknown as Row[];

  const pages: DashboardPageRow[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    published: !!r.published,
    updated_at: r.updated_at,
  }));

  return <DashboardClient initialPages={pages} />;
}
