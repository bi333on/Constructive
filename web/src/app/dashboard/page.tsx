import { requireUser } from "@/lib/auth-session";
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

export default async function DashboardPage() {
  const user = await requireUser();
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, title, slug, published, updated_at FROM pages WHERE user_id = ? ORDER BY updated_at DESC",
    )
    .all(user.id) as unknown as Row[];

  const pages: DashboardPageRow[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    published: !!r.published,
    updated_at: r.updated_at,
  }));

  return <DashboardClient initialPages={pages} email={user.email} />;
}
