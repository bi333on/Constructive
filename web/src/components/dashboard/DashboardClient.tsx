"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Globe, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createPage,
  deletePage,
  publishPage,
  unpublishPage,
  type ActionResult,
} from "@/app/actions/pages";

export interface DashboardPageRow {
  id: string;
  title: string;
  slug: string | null;
  published: boolean;
  updated_at: string;
}

export function DashboardClient({
  initialPages,
}: {
  initialPages: DashboardPageRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      setError(null);
      const res = await action();
      if (res.error) setError(res.error);
      router.refresh();
    });

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Мои страницы</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Создавайте и публикуйте страницы.
            </p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(createPage)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Новая страница
          </button>
        </header>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        <ul className="space-y-3">
          {initialPages.map((page) => (
            <li
              key={page.id}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4"
            >
              <div>
                <div className="font-medium text-neutral-900">{page.title}</div>
                <div className="mt-0.5 text-xs text-neutral-400">
                  {page.slug ? `/p/${page.slug}` : "без адреса"} ·{" "}
                  {page.published ? "опубликована" : "черновик"}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/?page=${page.id}`}
                  title="Редактировать"
                  className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                {page.published && page.slug && (
                  <Link
                    href={`/p/${page.slug}`}
                    target="_blank"
                    title="Открыть опубликованную страницу"
                    className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
                {page.published ? (
                  <button
                    type="button"
                    onClick={() => run(() => unpublishPage(page.id))}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                  >
                    Снять с публикации
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => run(() => publishPage(page.id))}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                  >
                    <Globe className="h-3.5 w-3.5" /> Опубликовать
                  </button>
                )}
                <button
                  type="button"
                  title="Удалить"
                  onClick={() => run(() => deletePage(page.id))}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
          {initialPages.length === 0 && (
            <li className="rounded-xl border border-dashed border-neutral-300 bg-white/60 p-10 text-center text-sm text-neutral-400">
              Пока нет страниц. Нажмите «Новая страница».
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
