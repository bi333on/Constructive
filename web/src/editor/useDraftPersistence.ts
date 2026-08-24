"use client";

import { useEffect, useRef } from "react";
import { useEditorStore, useSaveStore } from "./store";

const DRAFT_KEY = "builder:draft:v1";

/**
 * Автосохранение черновика в localStorage (debounce 600 мс).
 * При монтировании восстанавливает последний черновик.
 * В Фазе 5 будет заменено сохранением в Supabase.
 */
export function useDraftPersistence() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Восстановление черновика.
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const page = JSON.parse(raw);
        if (page && Array.isArray(page.blocks) && typeof page.title === "string") {
          useEditorStore.getState().setPage(page);
        }
      }
    } catch {
      // повреждённый черновик игнорируем
    }

    const schedule = () => {
      useSaveStore.getState().setStatus("dirty");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        try {
          const page = useEditorStore.getState().page;
          localStorage.setItem(DRAFT_KEY, JSON.stringify(page));
          useSaveStore.getState().setStatus("saved");
        } catch {
          useSaveStore.getState().setStatus("dirty");
        }
      }, 600);
    };

    const unsubscribe = useEditorStore.subscribe((state, prev) => {
      if (state.page !== prev.page) schedule();
    });

    return () => {
      unsubscribe();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
}
