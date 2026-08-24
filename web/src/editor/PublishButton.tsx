"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { publishPage, savePage } from "@/app/actions/pages";
import { useEditorStore } from "./store";

/** Кнопка «Опубликовать»: при необходимости сохраняет страницу и публикует её. */
export function PublishButton() {
  const [busy, setBusy] = useState(false);
  const pageId = useEditorStore((s) => s.pageId);

  const onClick = async () => {
    setBusy(true);
    try {
      let id = pageId;
      if (!id) {
        const state = useEditorStore.getState();
        const saved = await savePage({
          title: state.page.title,
          slug: state.page.slug,
          description: state.page.description,
          blocks: state.page.blocks,
        });
        if (saved.error) {
          window.alert(saved.error);
          return;
        }
        id = saved.id!;
        useEditorStore.getState().setPageId(id);
      }

      const published = await publishPage(id);
      if (published.error) {
        window.alert(published.error);
        return;
      }
      if (published.slug) {
        window.open(`/p/${published.slug}`, "_blank");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
    >
      <Globe className="h-4 w-4" />
      {busy ? "Публикация…" : "Опубликовать"}
    </button>
  );
}
