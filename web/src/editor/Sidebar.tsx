"use client";

import { LayoutGrid } from "lucide-react";
import { useEditorStore } from "./store";
import { BlockPicker } from "./BlockPicker";

export function Sidebar() {
  const addBlock = useEditorStore((s) => s.addBlock);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-200 bg-white md:flex">
      <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
        <LayoutGrid className="h-4 w-4 text-neutral-400" />
        <span className="text-sm font-semibold text-neutral-700">Блоки</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <BlockPicker onPick={(type) => addBlock(type)} columns={2} />
      </div>
      <div className="space-y-1 border-t border-neutral-200 p-3 text-xs text-neutral-400">
        <p>Перетаскивайте блоки на холсте, чтобы менять порядок.</p>
        <p className="text-neutral-300">
          ⌘Z — отмена · ⌘D — дублировать · Delete — удалить · Esc — снять выделение
        </p>
      </div>
    </aside>
  );
}
