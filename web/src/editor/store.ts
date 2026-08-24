"use client";

import { create } from "zustand";
import { temporal } from "zundo";
import type { BlockInstance, BlockProps, PageData } from "@/blocks/types";
import { getBlockDefinition } from "@/blocks/registry";
import { slugify, uid } from "@/lib/utils";

export interface EditorState {
  page: PageData;
  /** id страницы в БД (null — локальный черновик, ещё не сохранён в облако). */
  pageId: string | null;
  selectedId: string | null;
  hoveredId: string | null;

  select: (id: string | null) => void;
  hover: (id: string | null) => void;

  addBlock: (type: string, index?: number) => void;
  updateProps: (id: string, patch: BlockProps) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (activeId: string, overId: string) => void;
  moveBlockBy: (id: string, delta: number) => void;

  updatePageMeta: (meta: Partial<Pick<PageData, "title" | "slug" | "description">>) => void;
  setPage: (page: PageData) => void;
  setPageId: (pageId: string | null) => void;
  /** Загружает страницу целиком (из облака) с id записи. */
  loadPage: (page: PageData, pageId: string | null) => void;
  /** Заменяет все блоки страницы (загрузка шаблона). */
  setBlocks: (blocks: BlockInstance[]) => void;
}

export const emptyPage = (): PageData => ({
  id: uid(),
  title: "Новая страница",
  slug: "",
  description: "",
  blocks: [],
});

export const useEditorStore = create<EditorState>()(
  temporal(
    (set, get) => ({
      page: emptyPage(),
      pageId: null,
      selectedId: null,
      hoveredId: null,

      select: (id) => set({ selectedId: id }),
      hover: (id) => set({ hoveredId: id }),

      addBlock: (type, index) => {
        const def = getBlockDefinition(type);
        if (!def) return;
        const block: BlockInstance = {
          id: uid(),
          type,
          props: { ...def.defaultProps },
        };
        const blocks = [...get().page.blocks];
        const at = index ?? blocks.length;
        blocks.splice(at, 0, block);
        set({
          page: { ...get().page, blocks },
          selectedId: block.id,
        });
      },

      updateProps: (id, patch) =>
        set((state) => ({
          page: {
            ...state.page,
            blocks: state.page.blocks.map((b) =>
              b.id === id ? { ...b, props: { ...b.props, ...patch } } : b,
            ),
          },
        })),

      removeBlock: (id) =>
        set((state) => ({
          page: {
            ...state.page,
            blocks: state.page.blocks.filter((b) => b.id !== id),
          },
          selectedId: state.selectedId === id ? null : state.selectedId,
        })),

      duplicateBlock: (id) =>
        set((state) => {
          const idx = state.page.blocks.findIndex((b) => b.id === id);
          if (idx < 0) return {};
          const source = state.page.blocks[idx];
          const copy: BlockInstance = {
            id: uid(),
            type: source.type,
            props: { ...source.props },
          };
          const blocks = [...state.page.blocks];
          blocks.splice(idx + 1, 0, copy);
          return {
            page: { ...state.page, blocks },
            selectedId: copy.id,
          };
        }),

      moveBlock: (activeId, overId) =>
        set((state) => {
          const blocks = [...state.page.blocks];
          const oldIndex = blocks.findIndex((b) => b.id === activeId);
          const newIndex = blocks.findIndex((b) => b.id === overId);
          if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return {};
          const [moved] = blocks.splice(oldIndex, 1);
          blocks.splice(newIndex, 0, moved);
          return { page: { ...state.page, blocks } };
        }),

      moveBlockBy: (id, delta) =>
        set((state) => {
          const blocks = [...state.page.blocks];
          const index = blocks.findIndex((b) => b.id === id);
          const target = index + delta;
          if (index < 0 || target < 0 || target >= blocks.length) return {};
          const [moved] = blocks.splice(index, 1);
          blocks.splice(target, 0, moved);
          return { page: { ...state.page, blocks } };
        }),

      updatePageMeta: (meta) =>
        set((state) => ({
          page: {
            ...state.page,
            ...meta,
            // slug всегда выводится из title, если не задан явно
            slug: meta.slug ?? state.page.slug,
          },
        })),

      setPage: (page) => set({ page, selectedId: null, hoveredId: null }),

      setPageId: (pageId) => set({ pageId }),

      loadPage: (page, pageId) =>
        set({ page, pageId, selectedId: null, hoveredId: null }),

      setBlocks: (blocks) =>
        set((state) => ({ page: { ...state.page, blocks }, selectedId: null })),
    }),
    {
      // В историю попадают только изменения страницы, но не выделение/ховер.
      partialize: (state) => ({ page: state.page }),
      limit: 100,
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    },
  ),
);

/** Доступ к undo/redo. */
export const temporalStore = useEditorStore.temporal;

/** Вспомогательный экспорт для slug из title (используется при сохранении). */
export function slugForTitle(title: string, current?: string) {
  if (current) return current;
  return slugify(title);
}

export type SaveStatus = "saved" | "dirty";

interface SaveState {
  status: SaveStatus;
  setStatus: (status: SaveStatus) => void;
}

/** Статус автосохранения (пока — локальный черновик; Фаза 5 переведёт на Supabase). */
export const useSaveStore = create<SaveState>()((set) => ({
  status: "saved",
  setStatus: (status) => set({ status }),
}));

export interface InlineEditRequest {
  blockId: string;
  fieldKeys: string[];
}

interface InlineEditState {
  edit: InlineEditRequest | null;
  begin: (blockId: string, fieldKeys: string[]) => void;
  end: () => void;
}

/** Текущий инлайн-редактируемый элемент (узкая панель инструментов). */
export const useInlineStore = create<InlineEditState>()((set) => ({
  edit: null,
  begin: (blockId, fieldKeys) => set({ edit: { blockId, fieldKeys } }),
  end: () => set({ edit: null }),
}));
