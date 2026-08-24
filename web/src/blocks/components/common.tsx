import type { CSSProperties, ReactNode } from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { richTextToHtml } from "@/lib/rich";
import type { BlockProps } from "../types";
import { col } from "../types";

export interface BlockRenderProps {
  props: BlockProps;
  /** false в редакторе — ссылки и кнопки не интерактивны. */
  interactive?: boolean;
}

/** Секция: применяет фон и цвет текста из props. */
export function Section({
  props,
  children,
  className,
  style,
}: {
  props: BlockProps;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      className={cn("w-full", className)}
      style={{
        backgroundColor: col(props, "bg", "#ffffff"),
        color: col(props, "textColor", "#111827"),
        ...style,
      }}
    >
      {children}
    </section>
  );
}

/** Контейнер с ограничением ширины. */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6", className)}>{children}</div>
  );
}

/** Кнопка блока. Если задана ссылка — рендерится как <a>. */
export function BlockButton({
  bg,
  fg,
  outline,
  href,
  interactive = true,
  children,
}: {
  bg: string;
  fg: string;
  outline?: boolean;
  href?: string;
  interactive?: boolean;
  children: ReactNode;
}) {
  const cls =
    "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold";
  const style = {
    backgroundColor: outline ? "transparent" : bg,
    color: fg,
    border: outline ? `1px solid ${fg}` : undefined,
  };
  const content =
    typeof children === "string" ? (
      <span dangerouslySetInnerHTML={{ __html: richTextToHtml(children) }} />
    ) : (
      children
    );

  if (href && interactive) {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className={cls}
        style={style}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <span className={cls} style={style}>
      {content}
    </span>
  );
}

/** Картинка блока: плейсхолдер, если URL пустой. */
export function BlockImage({
  src,
  alt,
  aspect,
  className,
}: {
  src: string;
  alt: string;
  aspect?: "video" | "square" | "auto";
  className?: string;
}) {
  const aspectClass =
    aspect === "video"
      ? "aspect-video"
      : aspect === "square"
        ? "aspect-square"
        : "min-h-48";

  if (!src) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-xl bg-neutral-200 text-neutral-400",
          aspectClass,
          className,
        )}
      >
        <ImageIcon className="h-8 w-8" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("w-full rounded-xl object-cover", aspectClass, className)}
    />
  );
}
