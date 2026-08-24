"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { getBlockDefinition } from "@/blocks/registry";
import { FieldEditor } from "./FieldEditor";
import { useEditorStore } from "./store";

/**
 * Модальное окно настроек блока (контент + стиль).
 * Открывается кнопкой «Настройки блока» в ховер-тулбаре блока.
 */
export function BlockSettingsModal({
  blockId,
  onClose,
}: {
  blockId: string;
  onClose: () => void;
}) {
  const block = useEditorStore((s) => s.page.blocks.find((b) => b.id === blockId));
  const updateProps = useEditorStore((s) => s.updateProps);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!block) return null;

  const def = getBlockDefinition(block.type);
  const contentFields = (def?.fields ?? []).filter((f) => (f.group ?? "content") === "content");
  const styleFields = (def?.fields ?? []).filter((f) => f.group === "style");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-neutral-950/60 p-4 pt-10"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-neutral-800">{def?.name ?? "Блок"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {contentFields.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Контент</h3>
              {contentFields.map((f) => (
                <FieldEditor
                  key={f.key}
                  field={f}
                  value={block.props[f.key]}
                  onChange={(value) => updateProps(block.id, { [f.key]: value })}
                />
              ))}
            </section>
          )}
          {styleFields.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Стиль</h3>
              {styleFields.map((f) => (
                <FieldEditor
                  key={f.key}
                  field={f}
                  value={block.props[f.key]}
                  onChange={(value) => updateProps(block.id, { [f.key]: value })}
                />
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
