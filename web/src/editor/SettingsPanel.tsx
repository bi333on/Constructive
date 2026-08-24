"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { getBlockDefinition } from "@/blocks/registry";
import { slugify, cn } from "@/lib/utils";
import { useEditorStore } from "./store";
import { FieldEditor } from "./FieldEditor";

type Tab = "content" | "style";

const inputCls =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

const labelCls = "block text-xs font-medium text-neutral-500";

/** Настройки выбранного блока: вкладки «Контент» / «Стиль». */
function BlockSettings({ blockId }: { blockId: string }) {
  const block = useEditorStore((s) => s.page.blocks.find((b) => b.id === blockId));
  const select = useEditorStore((s) => s.select);
  const updateProps = useEditorStore((s) => s.updateProps);
  const [tab, setTab] = useState<Tab>("content");

  if (!block) return null;

  const def = getBlockDefinition(block.type);
  const fields = (def?.fields ?? []).filter((f) => (f.group ?? "content") === tab);

  return (
    <>
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <span className="text-sm font-semibold text-neutral-800">{def?.name}</span>
        <button
          type="button"
          onClick={() => select(null)}
          className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex border-b border-neutral-200">
        {(["content", "style"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium transition-colors",
              tab === t
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-neutral-500 hover:text-neutral-700",
            )}
          >
            {t === "content" ? "Контент" : "Стиль"}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {fields.length === 0 ? (
          <p className="text-sm text-neutral-400">Нет настроек в этой вкладке.</p>
        ) : (
          fields.map((field) => (
            <FieldEditor
              key={field.key}
              field={field}
              value={block.props[field.key]}
              onChange={(value) => updateProps(block.id, { [field.key]: value })}
            />
          ))
        )}
      </div>
    </>
  );
}

/** Настройки страницы (SEO): название, slug, описание. */
function PageSettings() {
  const page = useEditorStore((s) => s.page);
  const updatePageMeta = useEditorStore((s) => s.updatePageMeta);
  const slugTouched = useRef(false);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-neutral-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-neutral-800">Настройки страницы</h2>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
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
  );
}

export function SettingsPanel() {
  const selectedId = useEditorStore((s) => s.selectedId);
  const select = useEditorStore((s) => s.select);

  return (
    <>
      {/* Десктоп: боковая панель справа */}
      <aside className="hidden w-80 shrink-0 border-l border-neutral-200 bg-white lg:flex lg:flex-col">
        {selectedId ? <BlockSettings blockId={selectedId} /> : <PageSettings />}
      </aside>

      {/* Мобильные: нижний лист с настройками выбранного блока */}
      {selectedId && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-neutral-950/40"
            onClick={() => select(null)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[75vh] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl">
            <BlockSettings blockId={selectedId} />
          </div>
        </div>
      )}
    </>
  );
}
