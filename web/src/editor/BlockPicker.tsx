"use client";

import { blockList } from "@/blocks/registry";

export function BlockPicker({
  onPick,
  columns = 2,
}: {
  onPick: (type: string) => void;
  columns?: 2 | 3;
}) {
  return (
    <div className={columns === 2 ? "grid grid-cols-2 gap-2" : "grid grid-cols-3 gap-2"}>
      {blockList.map((b) => {
        const Icon = b.icon;
        return (
          <button
            key={b.definition.type}
            type="button"
            onClick={() => onPick(b.definition.type)}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-neutral-200 p-3 text-xs font-medium text-neutral-600 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
          >
            <Icon className="h-5 w-5" />
            <span className="leading-tight">{b.definition.name}</span>
          </button>
        );
      })}
    </div>
  );
}
