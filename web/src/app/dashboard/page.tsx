import { requireUser } from "@/lib/auth-session";
import { listProjects, type ProjectRow } from "@/app/actions/projects";
import { ProjectsClient } from "@/components/dashboard/ProjectsClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const { projects } = await listProjects();

  return (
    <ProjectsClient projects={(projects ?? []) as ProjectRow[]} email={user.email} />
  );
}
