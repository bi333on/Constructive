"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderOpen, LogOut, Plus, Trash2 } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import {
  createProject,
  deleteProject,
  renameProject,
  type ProjectRow,
} from "@/app/actions/projects";

export function ProjectsClient({
  projects,
  email,
}: {
  projects: ProjectRow[];
  email?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;

  const run = (fn: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (res.error) setError(res.error);
      router.refresh();
    });

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Мои проекты</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {email ? `${email} · ` : ""}Сайты и их страницы.
            </p>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            <LogOut className="h-4 w-4" /> Выйти
          </button>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            run(() => createProject(name));
            setName("");
          }}
          className="mb-6 flex gap-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название нового сайта"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            disabled={isPending}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Создать сайт
          </button>
        </form>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        <ul className="space-y-3">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4"
            >
              <div className="min-w-0">
                {renamingId === project.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => {
                      if (renameValue.trim() && renameValue !== project.name) {
                        run(() => renameProject(project.id, renameValue));
                      }
                      setRenamingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    }}
                    className="rounded border border-blue-400 px-2 py-1 text-sm font-medium focus:outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setRenameValue(project.name);
                      setRenamingId(project.id);
                    }}
                    className="truncate text-left font-medium text-neutral-900 hover:text-blue-600"
                  >
                    {project.name}
                  </button>
                )}
                <div className="mt-0.5 truncate text-xs text-neutral-400">
                  {baseDomain ? `${project.subdomain}.${baseDomain}` : project.subdomain}{" "}
                  · {project.page_count} стр.
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Link
                  href={`/dashboard/project/${project.id}`}
                  title="Открыть страницы"
                  className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                >
                  <FolderOpen className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  title="Удалить"
                  onClick={() => run(() => deleteProject(project.id))}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
          {projects.length === 0 && (
            <li className="rounded-xl border border-dashed border-neutral-300 bg-white/60 p-10 text-center text-sm text-neutral-400">
              Пока нет проектов. Создайте первый сайт выше.
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
