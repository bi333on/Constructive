"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { getBlockDefinition } from "@/blocks/registry";
import { FieldEditor } from "./FieldEditor";
import { useEditorStore, useInlineStore } from "./store";

/**
 * Узкая плавающая панель инструментов для выбранного инлайн-элемента.
 * Показывает только те поля, которые относятся к элементу (fieldKeys).
 */
export function InlineToolbar() {
  const edit = useInlineStore((s) => s.edit);
  const end = useInlineStore((s) => s.end);

  const blockId = edit?.blockId ?? null;
  const block = useEditorStore((s) =>
    blockId ? s.page.blocks.find((b) => b.id === blockId) : undefined,
  );
  const updateProps = useEditorStore((s) => s.updateProps);

  useEffect(() => {
    if (!edit) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") end();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [edit, end]);

  if (!edit || !block) return null;

  const def = getBlockDefinition(block.type);
  const fields = (def?.fields ?? []).filter((f) => edit.fieldKeys.includes(f.key));
  if (fields.length === 0) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-16 z-[90] -translate-x-1/2">
      <div className="pointer-events-auto flex max-w-[92vw] items-start gap-4 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl">
        {fields.map((f) => (
          <div key={f.key} className={f.type === "textarea" ? "w-72" : "w-48"}>
            <FieldEditor
              field={f}
              value={block.props[f.key]}
              onChange={(value) => updateProps(block.id, { [f.key]: value })}
            />
          </div>
        ))}
        <button
          type="button"
          title="Закрыть (Esc)"
          onClick={end}
          className="mt-5 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
