"use client";

import { useEffect, useState } from "react";
import { History, X } from "lucide-react";
import {
  getVersion,
  listVersions,
  type PageVersion,
} from "@/app/actions/pages";
import { useEditorStore } from "./store";

function formatDate(iso: string) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Кнопка и модальное окно истории версий страницы. */
export function HistoryButton() {
  const pageId = useEditorStore((s) => s.pageId);
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const openModal = async () => {
    setOpen(true);
    if (!pageId) return;
    setLoading(true);
    const res = await listVersions(pageId);
    setVersions(res.versions ?? []);
    setLoading(false);
  };

  const restore = async (id: string) => {
    setBusyId(id);
    const res = await getVersion(id);
    if (res.version) {
      const state = useEditorStore.getState();
      state.loadPage(
        {
          ...state.page,
          title: res.version.title,
          blocks: res.version.blocks,
        },
        state.pageId,
      );
    }
    setBusyId(null);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      <button
        type="button"
        title="История версий"
        onClick={openModal}
        className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
      >
        <History className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/60 p-4">
          <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-neutral-800">История версий</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-3">
              {!pageId ? (
                <p className="p-4 text-sm text-neutral-400">
                  Сохраните страницу, чтобы появилась история версий.
                </p>
              ) : loading ? (
                <p className="p-4 text-sm text-neutral-400">Загрузка…</p>
              ) : versions.length === 0 ? (
                <p className="p-4 text-sm text-neutral-400">Версий пока нет.</p>
              ) : (
                <ul className="space-y-1">
                  {versions.map((v, i) => (
                    <li
                      key={v.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-neutral-50"
                    >
                      <div>
                        <div className="text-sm text-neutral-800">
                          {v.title || "Без названия"}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {formatDate(v.created_at)}
                          {i === 0 ? " · последняя" : ""}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={busyId === v.id}
                        onClick={() => restore(v.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
                      >
                        {busyId === v.id ? "…" : "Восстановить"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
