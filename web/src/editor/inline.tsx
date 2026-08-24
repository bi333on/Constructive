"use client";

import {
  createContext,
  useContext,
  type CSSProperties,
  type JSX,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { richTextToHtml } from "@/lib/rich";

export interface InlineEditRequest {
  blockId: string;
  fieldKeys: string[];
}

interface InlineApi {
  begin: (blockId: string, fieldKeys: string[]) => void;
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
 * Инлайн-редактируемый элемент (текст/кнопка). Вне редактора
 * (публичный сайт, предпросмотр) рендерится как есть.
 */
export function Inline({
  fieldKeys,
  as,
  className,
  style,
  children,
}: {
  fieldKeys: string[];
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ctx = useInline();
  const html = typeof children === "string" ? richTextToHtml(children) : null;

  if (!ctx) {
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
  const cls = cn(
    "cursor-text rounded-sm transition-shadow hover:ring-2 hover:ring-blue-400/70",
    className,
  );
  const handlers = {
    onClick: (e: MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      ctx.begin(ctx.blockId, fieldKeys);
    },
    onMouseDown: (e: MouseEvent<HTMLElement>) => e.stopPropagation(),
  };

  return html !== null ? (
    <Tag
      className={cls}
      style={style}
      {...handlers}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <Tag className={cls} style={style} {...handlers}>
      {children}
    </Tag>
  );
}
