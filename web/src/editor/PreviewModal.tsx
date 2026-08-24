"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Tablet, X } from "lucide-react";
import { savePage } from "@/app/actions/pages";
import { cn } from "@/lib/utils";
import { useEditorStore } from "./store";

type Device = "desktop" | "tablet" | "mobile";

const deviceWidth: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

/**
 * Предпросмотр в iframe: у iframe собственный viewport, поэтому
 * Tailwind-брейкпоинты (md:/lg:) корректно реагируют на ширину устройства.
 */
export function PreviewModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pageId = useEditorStore((s) => s.pageId);
  const [device, setDevice] = useState<Device>("desktop");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // При открытии гарантируем, что последняя версия сохранена в БД.
  useEffect(() => {
    if (!open) return;
    (async () => {
      let id = pageId;
      if (!id) {
        setSaving(true);
        const state = useEditorStore.getState();
        const res = await savePage({
          title: state.page.title,
          slug: state.page.slug,
          description: state.page.description,
          blocks: state.page.blocks,
        });
        if (res.error) {
          setSaving(false);
          return;
        }
        id = res.id!;
        useEditorStore.getState().setPageId(id);
      }
      setPreviewId(id);
      setSaving(false);
    })();
  }, [open, pageId]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const devices: { id: Device; icon: typeof Monitor; label: string }[] = [
    { id: "desktop", icon: Monitor, label: "Компьютер" },
    { id: "tablet", icon: Tablet, label: "Планшет" },
    { id: "mobile", icon: Smartphone, label: "Телефон" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-neutral-950/95">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
          {devices.map((d) => {
            const Icon = d.icon;
            return (
              <button
                key={d.id}
                type="button"
                title={d.label}
                onClick={() => setDevice(d.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  device === d.id
                    ? "bg-white text-neutral-900"
                    : "text-neutral-300 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          Закрыть <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        <div
          className="mx-auto h-[calc(100vh-9rem)] overflow-hidden rounded-lg bg-white shadow-2xl transition-all duration-200"
          style={{
            width: deviceWidth[device],
            maxWidth: device === "desktop" ? "100%" : undefined,
          }}
        >
          {saving || !previewId ? (
            <div className="flex h-full items-center justify-center text-neutral-400">
              Подготовка предпросмотра…
            </div>
          ) : (
            <iframe
              key={previewId}
              src={`/preview/${previewId}`}
              title="Предпросмотр"
              className="h-full w-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}
