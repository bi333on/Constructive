"use client";

import { useState, type ReactNode } from "react";
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
  Copy,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { blockRegistry } from "@/blocks/registry";
import type { BlockInstance } from "@/blocks/types";
import { cn } from "@/lib/utils";
import { useEditorStore } from "./store";
import { BlockPicker } from "./BlockPicker";

function ToolButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: (e: React.MouseEvent) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
    >
      {children}
    </button>
  );
}

function BlockItem({ block }: { block: BlockInstance }) {
  const selected = useEditorStore((s) => s.selectedId === block.id);
  const hovered = useEditorStore((s) => s.hoveredId === block.id);
  const index = useEditorStore((s) => s.page.blocks.findIndex((b) => b.id === block.id));

  const select = useEditorStore((s) => s.select);
  const hover = useEditorStore((s) => s.hover);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const moveBlockBy = useEditorStore((s) => s.moveBlockBy);
  const addBlock = useEditorStore((s) => s.addBlock);

  const [pickerOpen, setPickerOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const reg = blockRegistry[block.type];
  const visible = selected || hovered || pickerOpen;

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
        <div className="absolute -top-3.5 right-3 z-30 flex items-center gap-0.5 rounded-lg border border-neutral-200 bg-white p-0.5 shadow-md">
          <ToolButton title="Выше" onClick={(e) => { e.stopPropagation(); moveBlockBy(block.id, -1); }}>
            <ArrowUp className="h-3.5 w-3.5" />
          </ToolButton>
          <ToolButton title="Ниже" onClick={(e) => { e.stopPropagation(); moveBlockBy(block.id, 1); }}>
            <ArrowDown className="h-3.5 w-3.5" />
          </ToolButton>
          <ToolButton title="Дублировать" onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}>
            <Copy className="h-3.5 w-3.5" />
          </ToolButton>
          <ToolButton title="Вставить блок после" onClick={(e) => { e.stopPropagation(); setPickerOpen((v) => !v); }}>
            <Plus className="h-3.5 w-3.5" />
          </ToolButton>
          <ToolButton title="Удалить" onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}>
            <Trash2 className="h-3.5 w-3.5" />
          </ToolButton>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none p-1 text-neutral-400 hover:text-neutral-600 active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        </div>
      )}

      {pickerOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setPickerOpen(false);
            }}
          />
          <div
            className="absolute left-3 top-8 z-50 w-72 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2 py-1 text-xs font-medium text-neutral-400">Вставить блок</div>
            <BlockPicker
              onPick={(type) => {
                addBlock(type, index + 1);
                setPickerOpen(false);
              }}
            />
          </div>
        </>
      )}

      {reg.render({ props: block.props })}
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

function AddBlockFooter() {
  const addBlock = useEditorStore((s) => s.addBlock);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mt-4 flex justify-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-dashed border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-500 transition-colors hover:border-blue-400 hover:text-blue-600"
      >
        <Plus className="h-4 w-4" /> Добавить блок
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-12 left-1/2 z-50 w-80 -translate-x-1/2 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl">
            <BlockPicker onPick={(type) => { addBlock(type); setOpen(false); }} columns={2} />
          </div>
        </>
      )}
    </div>
  );
}

export function BlockCanvas() {
  const blocks = useEditorStore((s) => s.page.blocks);
  const select = useEditorStore((s) => s.select);
  const moveBlock = useEditorStore((s) => s.moveBlock);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveBlock(String(active.id), String(over.id));
    }
  };

  return (
    <div
      className="mx-auto w-full max-w-5xl px-4 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) select(null);
      }}
    >
      {blocks.length === 0 ? (
        <EmptyCanvas />
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {blocks.map((block) => (
                  <BlockItem key={block.id} block={block} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <AddBlockFooter />
        </>
      )}
    </div>
  );
}
