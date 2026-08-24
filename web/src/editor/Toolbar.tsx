"use client";

import { FolderOpen, Redo2, Undo2 } from "lucide-react";
import Link from "next/link";
import { useStore } from "zustand";
import { useEditorStore, temporalStore, useSaveStore } from "./store";
import { cn } from "@/lib/utils";
import { PublishButton } from "./PublishButton";

export function Toolbar({ onPreview }: { onPreview: () => void }) {
  const title = useEditorStore((s) => s.page.title);
  const updatePageMeta = useEditorStore((s) => s.updatePageMeta);
  const saveStatus = useSaveStore((s) => s.status);

  const canUndo = useStore(temporalStore, (s) => s.pastStates.length > 0);
  const canRedo = useStore(temporalStore, (s) => s.futureStates.length > 0);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          B
        </div>
        <span className="hidden text-sm font-semibold text-neutral-800 sm:block">Конструктор</span>
      </div>

      <div className="mx-2 h-6 w-px bg-neutral-200" />

      <input
        value={title}
        onChange={(e) => updatePageMeta({ title: e.target.value })}
        placeholder="Название страницы"
        className="w-40 rounded-lg border border-transparent px-2 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-200 focus:border-blue-500 focus:outline-none sm:w-64"
      />

      <div className="flex-1" />

      <span
        className={cn(
          "hidden text-xs sm:block",
          saveStatus === "saved" ? "text-neutral-400" : "text-amber-600",
        )}
      >
        {saveStatus === "saved" ? "Сохранено" : "Сохранение…"}
      </span>

      <Link
        href="/dashboard"
        title="Мои страницы"
        className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
      >
        <FolderOpen className="h-4 w-4" />
      </Link>

      <div className="flex items-center gap-1">
        <button
          type="button"
          title="Отменить (⌘Z)"
          disabled={!canUndo}
          onClick={() => temporalStore.getState().undo()}
          className={cn(
            "rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100",
            !canUndo && "cursor-not-allowed opacity-30 hover:bg-transparent",
          )}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Повторить (⇧⌘Z)"
          disabled={!canRedo}
          onClick={() => temporalStore.getState().redo()}
          className={cn(
            "rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100",
            !canRedo && "cursor-not-allowed opacity-30 hover:bg-transparent",
          )}
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      <PublishButton />

      <button
        type="button"
        onClick={onPreview}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Предпросмотр
      </button>
    </header>
  );
}
