"use client";

import { useEffect } from "react";
import { temporalStore, useEditorStore } from "./store";

/** Горячие клавиши редактора. */
export function useEditorHotkeys() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      const mod = e.metaKey || e.ctrlKey;

      // Undo / Redo
      if (mod && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        temporalStore.getState().undo();
        return;
      }
      if (mod && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        e.preventDefault();
        temporalStore.getState().redo();
        return;
      }
      // Дублировать
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        const id = useEditorStore.getState().selectedId;
        if (id) useEditorStore.getState().duplicateBlock(id);
        return;
      }

      if (isTyping) return;

      // Удалить / снять выделение
      if (e.key === "Delete" || e.key === "Backspace") {
        const id = useEditorStore.getState().selectedId;
        if (id) {
          e.preventDefault();
          useEditorStore.getState().removeBlock(id);
        }
      } else if (e.key === "Escape") {
        useEditorStore.getState().select(null);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
