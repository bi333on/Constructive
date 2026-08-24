"use client";

import { useEffect, useRef } from "react";
import { getPage, savePage } from "@/app/actions/pages";
import { slugify } from "@/lib/utils";
import { useEditorStore, useSaveStore } from "./store";

/**
 * Автосохранение в локальную БД (SQLite) через server action savePage.
 * При наличии ?page=<id> в URL загружает страницу из БД.
 */
export function useAutosave() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNext = useRef(false);

  useEffect(() => {
    let cancelled = false;

    // Загрузка страницы из URL (?page=<id>).
    const pageIdFromUrl = new URLSearchParams(window.location.search).get("page");
    if (pageIdFromUrl) {
      (async () => {
        const res = await getPage(pageIdFromUrl);
        if (!cancelled && res.page) {
          skipNext.current = true;
          useEditorStore.getState().loadPage(res.page, pageIdFromUrl);
        }
      })();
    }

    const schedule = () => {
      useSaveStore.getState().setStatus("dirty");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const state = useEditorStore.getState();
        const res = await savePage({
          id: state.pageId ?? undefined,
          title: state.page.title,
          slug: state.page.slug || slugify(state.page.title),
          description: state.page.description,
          blocks: state.page.blocks,
        });
        if (res.id) useEditorStore.getState().setPageId(res.id);
        useSaveStore.getState().setStatus(res.error ? "dirty" : "saved");
      }, 800);
    };

    const unsubscribe = useEditorStore.subscribe((state, prev) => {
      if (state.page !== prev.page) {
        if (skipNext.current) {
          skipNext.current = false;
          return;
        }
        schedule();
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
}
