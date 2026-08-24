"use client";

import { useEffect, useRef } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic } from "lucide-react";

function ToolBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="rounded p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
    >
      {children}
    </button>
  );
}

/** Редактор текста с форматированием (жирный/курсив, размер, цвет, выравнивание). */
export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      exec("insertLineBreak");
    }
  };

  return (
    <div className="w-full rounded-lg border border-neutral-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
      <div className="flex items-center gap-0.5 border-b border-neutral-200 px-1.5 py-1">
        <ToolBtn title="Жирный" onClick={() => exec("bold")}>
          <Bold className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Курсив" onClick={() => exec("italic")}>
          <Italic className="h-3.5 w-3.5" />
        </ToolBtn>
        <div className="mx-1 h-4 w-px bg-neutral-200" />
        <ToolBtn title="По левому краю" onClick={() => exec("justifyLeft")}>
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="По центру" onClick={() => exec("justifyCenter")}>
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="По правому краю" onClick={() => exec("justifyRight")}>
          <AlignRight className="h-3.5 w-3.5" />
        </ToolBtn>
        <div className="mx-1 h-4 w-px bg-neutral-200" />
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) exec("fontSize", e.target.value);
            e.target.value = "";
          }}
          className="h-7 rounded border border-neutral-200 bg-white px-1 text-xs text-neutral-600"
        >
          <option value="">Размер</option>
          <option value="2">Мелкий</option>
          <option value="3">Обычный</option>
          <option value="5">Крупный</option>
          <option value="7">Огромный</option>
        </select>
        <input
          type="color"
          title="Цвет текста"
          onChange={(e) => exec("foreColor", e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border border-neutral-200 bg-white p-0.5"
        />
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onKeyDown={handleKeyDown}
        className="min-h-16 w-full px-3 py-2 text-sm text-neutral-900 outline-none"
      />
    </div>
  );
}
