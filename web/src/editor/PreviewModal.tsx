"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Tablet, X } from "lucide-react";
import { blockRegistry } from "@/blocks/registry";
import { cn } from "@/lib/utils";
import { useEditorStore } from "./store";

type Device = "desktop" | "tablet" | "mobile";

const deviceWidth: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export function PreviewModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const blocks = useEditorStore((s) => s.page.blocks);
  const [device, setDevice] = useState<Device>("desktop");

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

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8">
        <div
          className="mx-auto overflow-hidden rounded-lg bg-white shadow-2xl transition-all duration-200"
          style={{ width: deviceWidth[device], maxWidth: device === "desktop" ? "100%" : undefined }}
        >
          {blocks.length === 0 ? (
            <div className="flex h-96 items-center justify-center text-neutral-400">
              Страница пуста
            </div>
          ) : (
            blocks.map((block) => {
              const reg = blockRegistry[block.type];
              if (!reg) return null;
              return (
                <div key={block.id}>{reg.render({ props: block.props })}</div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
