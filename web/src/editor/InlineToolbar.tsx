"use client";

import { useEffect, useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Link, Upload, X } from "lucide-react";
import { getBlockDefinition } from "@/blocks/registry";
import { useEditorStore, useInlineStore } from "./store";

function TBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="rounded-md p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
    >
      {children}
    </button>
  );
}

const exec = (cmd: string, arg?: string) => document.execCommand(cmd, false, arg);

const textColors = ["#111827", "#ef4444", "#f59e0b", "#16a34a", "#2563eb", "#7c3aed", "#ffffff"];
const sizes = [
  { label: "S", value: "2" },
  { label: "M", value: "3" },
  { label: "L", value: "5" },
  { label: "XL", value: "7" },
];

function Divider() {
  return <div className="mx-1 h-5 w-px bg-neutral-200" />;
}

function TextFormatBar() {
  return (
    <div className="flex items-center gap-0.5">
      <TBtn title="Жирный" onClick={() => exec("bold")}>
        <Bold className="h-4 w-4" />
      </TBtn>
      <TBtn title="Курсив" onClick={() => exec("italic")}>
        <Italic className="h-4 w-4" />
      </TBtn>
      <Divider />
      <TBtn title="По левому краю" onClick={() => exec("justifyLeft")}>
        <AlignLeft className="h-4 w-4" />
      </TBtn>
      <TBtn title="По центру" onClick={() => exec("justifyCenter")}>
        <AlignCenter className="h-4 w-4" />
      </TBtn>
      <TBtn title="По правому краю" onClick={() => exec("justifyRight")}>
        <AlignRight className="h-4 w-4" />
      </TBtn>
      <Divider />
      {sizes.map((s) => (
        <TBtn key={s.value} title={`Размер ${s.label}`} onClick={() => exec("fontSize", s.value)}>
          <span className="text-xs font-semibold">{s.label}</span>
        </TBtn>
      ))}
      <Divider />
      {textColors.map((c) => (
        <button
          key={c}
          type="button"
          title={c}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("foreColor", c)}
          className="h-5 w-5 rounded-full border border-neutral-300"
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function hex(value: unknown, fallback = "#000000") {
  const s = typeof value === "string" ? value : "";
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s : fallback;
}

function ImageBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || data.error) return;
      onChange(data.url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        <Upload className="h-3.5 w-3.5" />
        {uploading ? "Загрузка…" : "Загрузить"}
      </button>
      <input
        type="text"
        placeholder="URL картинки"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-64 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/**
 * Панель инструментов элемента в шапке редактора (во всю ширину).
 * Появляется по клику на элемент: текст — форматирование, кнопка — ссылка/цвета, картинка — загрузка.
 */
export function InlineToolbar() {
  const edit = useInlineStore((s) => s.edit);
  const end = useInlineStore((s) => s.end);
  const block = useEditorStore((s) =>
    edit ? s.page.blocks.find((b) => b.id === edit.blockId) : undefined,
  );
  const updateProps = useEditorStore((s) => s.updateProps);

  useEffect(() => {
    if (!edit) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") end();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [edit, end]);

  if (!edit || !block) return null;

  const def = getBlockDefinition(block.type);
  const fields = (def?.fields ?? []).filter((f) => edit.fieldKeys.includes(f.key));
  const linkFields = fields.filter((f) => f.type === "link");
  const colorFields = fields.filter((f) => f.type === "color");
  const imageFields = fields.filter((f) => f.type === "image");

  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-neutral-200 bg-white px-4">
      <span className="whitespace-nowrap text-xs font-medium text-neutral-400">
        {edit.kind === "image" ? "Картинка" : edit.kind === "button" ? "Кнопка" : "Текст"}
      </span>
      <div className="h-5 w-px bg-neutral-200" />

      {edit.kind === "text" && <TextFormatBar />}

      {edit.kind === "button" && (
        <div className="flex items-center gap-3">
          {linkFields.map((f) => (
            <div key={f.key} className="flex items-center gap-1.5">
              <Link className="h-4 w-4 text-neutral-400" />
              <input
                className="w-48 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                placeholder="https://…"
                value={String(block.props[f.key] ?? "")}
                onChange={(e) => updateProps(block.id, { [f.key]: e.target.value })}
              />
            </div>
          ))}
          {colorFields.map((f) => (
            <div key={f.key} className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-400">{f.label}</span>
              <input
                type="color"
                value={hex(block.props[f.key], String(f.defaultValue ?? "#000000"))}
                onChange={(e) => updateProps(block.id, { [f.key]: e.target.value })}
                className="h-7 w-9 cursor-pointer rounded border border-neutral-200 bg-white p-0.5"
              />
            </div>
          ))}
        </div>
      )}

      {edit.kind === "image" && imageFields[0] && (
        <ImageBar
          value={String(block.props[imageFields[0].key] ?? "")}
          onChange={(v) => updateProps(block.id, { [imageFields[0].key]: v })}
        />
      )}

      <div className="flex-1" />
      <button
        type="button"
        title="Готово (Esc)"
        onClick={end}
        className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
