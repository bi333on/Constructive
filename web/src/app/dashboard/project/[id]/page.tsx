import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-session";
import { getDb } from "@/lib/db";
import { listPages } from "@/app/actions/pages";
import { ProjectClient } from "@/components/dashboard/ProjectClient";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const row = getDb()
    .prepare("SELECT id, name, subdomain, domain FROM projects WHERE id = ? AND user_id = ?")
    .get(id, user.id) as unknown as
    | { id: string; name: string; subdomain: string | null; domain: string | null }
    | undefined;
  if (!row) notFound();

  const project = {
    id: row.id,
    name: row.name,
    subdomain: row.subdomain,
    domain: row.domain,
  };
  const { pages } = await listPages(id);

  return <ProjectClient project={project} pages={pages ?? []} />;
}
