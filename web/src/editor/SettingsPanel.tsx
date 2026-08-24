"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { getBlockDefinition } from "@/blocks/registry";
import { cn } from "@/lib/utils";
import { useEditorStore } from "./store";
import { FieldEditor } from "./FieldEditor";

type Tab = "content" | "style";

export function SettingsPanel() {
  const selectedId = useEditorStore((s) => s.selectedId);
  const block = useEditorStore((s) => s.page.blocks.find((b) => b.id === s.selectedId));
  const select = useEditorStore((s) => s.select);
  const updateProps = useEditorStore((s) => s.updateProps);

  const [tab, setTab] = useState<Tab>("content");

  if (!block) {
    return (
      <aside className="hidden w-80 shrink-0 border-l border-neutral-200 bg-white lg:block">
        <div className="p-4 text-sm text-neutral-400">
          Выберите блок, чтобы изменить его содержимое и стили.
        </div>
      </aside>
    );
  }

  const def = getBlockDefinition(block.type);
  const fields = (def?.fields ?? []).filter((f) => (f.group ?? "content") === tab);

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-neutral-200 bg-white">
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
    </aside>
  );
}
