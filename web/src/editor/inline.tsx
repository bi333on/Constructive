"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type CSSProperties,
  type JSX,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { richTextToHtml } from "@/lib/rich";
import { useEditorStore, useInlineStore, type InlineKind } from "./store";

interface InlineApi {
  begin: (blockId: string, fieldKeys: string[], kind: InlineKind) => void;
}

const ApiContext = createContext<InlineApi | null>(null);
const BlockContext = createContext<string | null>(null);

/** Провайдер инлайн-редактирования (монтируется только в редакторе). */
export function InlineProvider({
  begin,
  children,
}: {
  begin: InlineApi["begin"];
  children: ReactNode;
}) {
  return <ApiContext.Provider value={{ begin }}>{children}</ApiContext.Provider>;
}

/** Привязывает блок к его id для инлайн-редактирования. */
export function InlineBlock({
  blockId,
  children,
}: {
  blockId: string;
  children: ReactNode;
}) {
  return <BlockContext.Provider value={blockId}>{children}</BlockContext.Provider>;
}

function useInline() {
  const api = useContext(ApiContext);
  const blockId = useContext(BlockContext);
  if (!api || !blockId) return null;
  return { begin: api.begin, blockId };
}

/**
 * Инлайн-редактируемый элемент (текст/кнопка/картинка).
 * Вне редактора рендерится как есть. В редакторе текст правится прямо на месте
 * (contentEditable), кнопки/картинки подсвечиваются синей рамкой.
 */
export function Inline({
  fieldKeys,
  as,
  className,
  style,
  kind = "text",
  children,
}: {
  fieldKeys: string[];
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
  kind?: InlineKind;
  children: ReactNode;
}) {
  const ctx = useInline();
  const edit = useInlineStore((s) => s.edit);
  const updateProps = useEditorStore((s) => s.updateProps);
  const ref = useRef<HTMLElement>(null);

  const key = ctx ? `${ctx.blockId}:${fieldKeys.join(",")}` : null;
  const active = !!ctx && !!edit && edit.key === key && edit.kind === kind;
  const isTextEditing = active && kind === "text";

  // Синхронизируем contentEditable со значением (не трогаем при фокусе).
  useEffect(() => {
    const el = ref.current;
    if (!el || !isTextEditing) return;
    if (document.activeElement !== el) {
      const value = typeof children === "string" ? children : "";
      if (el.innerHTML !== value) el.innerHTML = value;
    }
  });

  // Автофокус при активации текстового элемента.
  useEffect(() => {
    if (!isTextEditing || !ref.current) return;
    const el = ref.current;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [isTextEditing]);

  if (!ctx) {
    const html = typeof children === "string" ? richTextToHtml(children) : null;
    if (as) {
      const Tag = as as any;
      return html !== null ? (
        <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <Tag className={className} style={style}>
          {children}
        </Tag>
      );
    }
    return html !== null ? (
      <span dangerouslySetInnerHTML={{ __html: html }} />
    ) : (
      <>{children}</>
    );
  }

  const Tag = (as ?? "span") as any;

  if (isTextEditing) {
    return (
      <Tag
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className={cn("cursor-text rounded-sm outline-none ring-2 ring-blue-600", className)}
        style={style}
        onInput={(e: React.FormEvent<HTMLElement>) => {
          updateProps(ctx.blockId, { [fieldKeys[0]]: (e.currentTarget as HTMLElement).innerHTML });
        }}
        onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
      />
    );
  }

  const html = typeof children === "string" ? richTextToHtml(children) : null;
  const ring = active ? "ring-2 ring-blue-600" : "hover:ring-2 hover:ring-blue-400/70";

  return (
    <Tag
      className={cn("cursor-text rounded-sm transition-shadow", ring, className)}
      style={style}
      onClick={(e: MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        ctx.begin(ctx.blockId, fieldKeys, kind);
      }}
      onMouseDown={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
      {...(html !== null ? { dangerouslySetInnerHTML: { __html: html } } : { children })}
    />
  );
}
