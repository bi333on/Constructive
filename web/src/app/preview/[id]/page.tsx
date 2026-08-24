import { notFound } from "next/navigation";
import { BlockList } from "@/components/BlockList";
import type { BlockInstance } from "@/blocks/types";
import { requireUser } from "@/lib/auth-session";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Рендер черновика страницы в iframe предпросмотра.
// Отдельный маршрут нужен, чтобы у iframe был собственный viewport
// (ширина устройства) и Tailwind-брейкпоинты работали корректно.

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const row = getDb()
    .prepare("SELECT blocks FROM pages WHERE id = ? AND user_id = ?")
    .get(id, user.id) as unknown as { blocks: string } | undefined;
  if (!row) notFound();

  const blocks = JSON.parse(row.blocks) as BlockInstance[];

  return (
    <main className="bg-white">
      <BlockList blocks={blocks} />
    </main>
  );
}
