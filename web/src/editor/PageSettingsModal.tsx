"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { slugify, cn } from "@/lib/utils";
import { useEditorStore } from "./store";

const inputCls =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

const labelCls = "block text-xs font-medium text-neutral-500";

/** Модальное окно настроек страницы (название, slug, описание). */
export function PageSettingsModal({ onClose }: { onClose: () => void }) {
  const page = useEditorStore((s) => s.page);
  const updatePageMeta = useEditorStore((s) => s.updatePageMeta);
  const slugTouched = useRef(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-neutral-800">Настройки страницы</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <div className="space-y-1.5">
            <label className={labelCls}>Название страницы</label>
            <input
              className={inputCls}
              value={page.title}
              onChange={(e) => {
                const title = e.target.value;
                updatePageMeta({
                  title,
                  slug: slugTouched.current ? page.slug : slugify(title),
                });
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Ссылка (slug)</label>
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 rounded-lg bg-neutral-100 px-2 py-2 text-sm text-neutral-400">
                /p/
              </span>
              <input
                className={inputCls}
                value={page.slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  updatePageMeta({ slug: slugify(e.target.value) });
                }}
                placeholder="moja-stranica"
              />
            </div>
            <p className="text-xs text-neutral-400">
              Адрес опубликованной страницы. Генерируется из названия автоматически.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Описание (SEO)</label>
            <textarea
              className={cn(inputCls, "min-h-24 resize-y")}
              value={page.description}
              onChange={(e) => updatePageMeta({ description: e.target.value })}
              placeholder="Краткое описание для поисковых систем"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
