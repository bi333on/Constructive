"use client";

import { useEffect, useState } from "react";
import { LayoutTemplate, X } from "lucide-react";
import { buildTemplateBlocks, templates } from "@/blocks/templates";
import { useEditorStore } from "./store";

/** Кнопка и модальное окно выбора шаблона страницы. */
export function TemplatesButton() {
  const setBlocks = useEditorStore((s) => s.setBlocks);
  const [open, setOpen] = useState(false);

  const load = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    setBlocks(buildTemplateBlocks(template));
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
        title="Шаблоны"
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
      >
        <LayoutTemplate className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/60 p-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-neutral-800">Шаблоны страниц</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="grid gap-4 overflow-y-auto p-5 sm:grid-cols-3">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col rounded-xl border border-neutral-200 p-4"
                >
                  <h3 className="font-semibold text-neutral-900">{t.name}</h3>
                  <p className="mt-1 flex-1 text-xs text-neutral-500">{t.description}</p>
                  <p className="mt-2 text-xs text-neutral-400">{t.blocks.length} блоков</p>
                  <button
                    type="button"
                    onClick={() => load(t.id)}
                    className="mt-4 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Загрузить
                  </button>
                </div>
              ))}
            </div>
            <p className="border-t border-neutral-200 px-5 py-3 text-xs text-neutral-400">
              Шаблон заменит текущие блоки страницы.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
