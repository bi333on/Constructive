"use client";

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlockField } from "@/blocks/types";

const inputCls =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

interface Props {
  field: BlockField;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function FieldEditor({ field, value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-neutral-500">{field.label}</label>
      <FieldControl field={field} value={value} onChange={onChange} />
    </div>
  );
}

function FieldControl({ field, value, onChange }: Props) {
  switch (field.type) {
    case "text":
      return (
        <input
          type="text"
          className={inputCls}
          placeholder={field.placeholder}
          value={String(value ?? field.defaultValue ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "textarea":
      return (
        <textarea
          className={cn(inputCls, "resize-y leading-relaxed")}
          rows={field.rows ?? 4}
          placeholder={field.placeholder}
          value={String(value ?? field.defaultValue ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "image": {
      const src = String(value ?? "");
      return (
        <div className="space-y-2">
          <div
            className={cn(
              "flex w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-300 bg-neutral-50",
              field.aspect === "video" && "aspect-video",
              field.aspect === "square" && "aspect-square",
              !src && field.aspect === "auto" && "min-h-20",
            )}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-neutral-400">Нет изображения</span>
            )}
          </div>
          <input
            type="text"
            className={inputCls}
            placeholder="URL изображения"
            value={src}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    }

    case "color": {
      const hex = typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value)
        ? value
        : String(field.defaultValue ?? "#000000");
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={hex.length === 4 || hex.length === 7 || hex.length === 9 ? hex : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-11 shrink-0 cursor-pointer rounded border border-neutral-300 bg-white p-0.5"
          />
          <input
            type="text"
            className={inputCls}
            value={hex}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    }

    case "number":
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            className={inputCls}
            value={Number(value ?? field.defaultValue ?? 0)}
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          {field.unit && <span className="shrink-0 text-xs text-neutral-400">{field.unit}</span>}
        </div>
      );

    case "select":
      return (
        <select
          className={inputCls}
          value={String(value ?? field.defaultValue ?? field.options[0]?.value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "toggle": {
      const on = Boolean(value ?? field.defaultValue ?? false);
      return (
        <button
          type="button"
          onClick={() => onChange(!on)}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            on ? "bg-blue-600" : "bg-neutral-300",
          )}
          aria-pressed={on}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
              on ? "left-[22px]" : "left-0.5",
            )}
          />
        </button>
      );
    }

    case "align": {
      const current = String(value ?? field.defaultValue ?? "left");
      const options = [
        { value: "left", icon: AlignLeft },
        { value: "center", icon: AlignCenter },
        { value: "right", icon: AlignRight },
      ];
      return (
        <div className="flex gap-1 rounded-lg border border-neutral-300 p-1">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={cn(
                  "flex flex-1 items-center justify-center rounded-md py-1.5 transition-colors",
                  current === opt.value ? "bg-blue-600 text-white" : "text-neutral-500 hover:bg-neutral-100",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      );
    }

    default:
      return null;
  }
}
