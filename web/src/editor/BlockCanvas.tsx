"use client";

import { Fragment, useState, type ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  ClipboardPaste,
  Copy,
  GripVertical,
  Paintbrush,
  Plus,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { blockRegistry } from "@/blocks/registry";
import type { BlockInstance } from "@/blocks/types";
import { cn } from "@/lib/utils";
import { useEditorStore, useInlineStore, useStyleClipboard } from "./store";
import { BlockPicker } from "./BlockPicker";
import { BlockSettingsModal } from "./BlockSettingsModal";
import { InlineBlock } from "./inline";

function ToolButton({
  title,
  onClick,
  children,
  danger,
}: {
  title: string;
  onClick: (e: React.MouseEvent) => void;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded-md p-1.5 text-neutral-400 transition-colors",
        danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-neutral-100 hover:text-neutral-700",
      )}
    >
      {children}
    </button>
  );
}

function BlockItem({
  block,
  onOpenSettings,
}: {
  block: BlockInstance;
  onOpenSettings: (id: string) => void;
}) {
  const selected = useEditorStore((s) => s.selectedId === block.id);
  const hovered = useEditorStore((s) => s.hoveredId === block.id);

  const select = useEditorStore((s) => s.select);
  const hover = useEditorStore((s) => s.hover);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const moveBlockBy = useEditorStore((s) => s.moveBlockBy);
  const copyStyle = useStyleClipboard((s) => s.copy);
  const pasteStyle = useStyleClipboard((s) => s.paste);
  const hasCopiedStyle = useStyleClipboard((s) => s.values !== null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const reg = blockRegistry[block.type];
  const visible = selected || hovered;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative", isDragging && "z-20 opacity-60")}
      onMouseEnter={() => hover(block.id)}
      onMouseLeave={() => hover(null)}
      onClick={(e) => {
        e.stopPropagation();
        select(block.id);
      }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-10 rounded-md ring-2 ring-inset",
          selected ? "ring-blue-600" : hovered ? "ring-blue-300" : "ring-transparent",
        )}
      />

      {visible && (
        <>
          <div className="pointer-events-none absolute -top-3.5 left-3 z-30 max-w-[55%] truncate rounded-md bg-neutral-800 px-2 py-0.5 text-[11px] font-medium text-white shadow">
            {reg.definition.name}
          </div>
          <div className="absolute -top-3.5 right-3 z-30 flex items-center gap-0.5 rounded-lg border border-neutral-200 bg-white p-1 shadow-md">
            <ToolButton title="Выше" onClick={(e) => { e.stopPropagation(); moveBlockBy(block.id, -1); }}>
              <ArrowUp className="h-4 w-4" />
            </ToolButton>
            <ToolButton title="Ниже" onClick={(e) => { e.stopPropagation(); moveBlockBy(block.id, 1); }}>
              <ArrowDown className="h-4 w-4" />
            </ToolButton>
            <ToolButton title="Дублировать" onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}>
              <Copy className="h-4 w-4" />
            </ToolButton>
            <ToolButton title="Копировать стиль" onClick={(e) => { e.stopPropagation(); copyStyle(block.id); }}>
              <Paintbrush className="h-4 w-4" />
            </ToolButton>
            {hasCopiedStyle && (
              <ToolButton title="Вставить стиль" onClick={(e) => { e.stopPropagation(); pasteStyle(block.id); }}>
                <ClipboardPaste className="h-4 w-4" />
              </ToolButton>
            )}
            <ToolButton title="Настройки блока" onClick={(e) => { e.stopPropagation(); onOpenSettings(block.id); }}>
              <Settings2 className="h-4 w-4" />
            </ToolButton>
            <ToolButton danger title="Удалить" onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}>
              <Trash2 className="h-4 w-4" />
            </ToolButton>
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab touch-none p-1.5 text-neutral-400 hover:text-neutral-600 active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
        </>
      )}

      <InlineBlock blockId={block.id}>
        {reg.render({ props: block.props, interactive: false })}
      </InlineBlock>
    </div>
  );
}

function EmptyCanvas() {
  const addBlock = useEditorStore((s) => s.addBlock);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-white/60 p-8 text-center">
      <h2 className="text-lg font-semibold text-neutral-700">Страница пуста</h2>
      <p className="mt-1 text-sm text-neutral-400">Добавьте первый блок, чтобы начать</p>
      <div className="relative mt-6 w-full max-w-md">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Добавить блок
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute left-1/2 top-12 z-50 w-80 -translate-x-1/2 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl">
              <BlockPicker onPick={(type) => { addBlock(type); setOpen(false); }} columns={2} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InsertDivider({ onInsert }: { onInsert: () => void }) {
  return (
    <div className="group relative z-20 -my-4 flex h-8 items-center justify-center">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
      <button
        type="button"
        title="Добавить блок"
        onClick={(e) => {
          e.stopPropagation();
          onInsert();
        }}
        className="relative z-10 flex h-7 w-7 scale-75 items-center justify-center rounded-full bg-blue-600 text-white opacity-0 shadow-md transition-all duration-150 hover:bg-blue-700 group-hover:scale-100 group-hover:opacity-100"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function BlockCanvas() {
  const blocks = useEditorStore((s) => s.page.blocks);
  const select = useEditorStore((s) => s.select);
  const moveBlock = useEditorStore((s) => s.moveBlock);
  const addBlock = useEditorStore((s) => s.addBlock);

  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveBlock(String(active.id), String(over.id));
    }
  };

  const closePicker = () => setInsertAt(null);
  const pick = (type: string) => {
    addBlock(type, insertAt ?? blocks.length);
    setInsertAt(null);
  };

  return (
    <div
      className="mx-auto w-full max-w-5xl px-4 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          select(null);
          useInlineStore.getState().end();
        }
      }}
    >
      {blocks.length === 0 ? (
        <EmptyCanvas />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div>
              {blocks.map((block, i) => (
                <Fragment key={block.id}>
                  <InsertDivider onInsert={() => setInsertAt(i)} />
                  <BlockItem block={block} onOpenSettings={setSettingsId} />
                </Fragment>
              ))}
            </div>
          </SortableContext>
          <InsertDivider onInsert={() => setInsertAt(blocks.length)} />
        </DndContext>
      )}

      {insertAt !== null && (
        <>
          <div className="fixed inset-0 z-40 bg-neutral-950/30" onClick={closePicker} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <span className="text-sm font-semibold text-neutral-800">Добавить блок</span>
              <button
                type="button"
                onClick={closePicker}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-3">
              <BlockPicker columns={2} onPick={pick} />
            </div>
          </aside>
        </>
      )}

      {settingsId && (
        <BlockSettingsModal blockId={settingsId} onClose={() => setSettingsId(null)} />
      )}
    </div>
  );
}
