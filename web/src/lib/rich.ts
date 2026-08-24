/** Минимальная санитизация HTML, созданного встроенным редактором. */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, "")
    .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["']?)\s*javascript:[^"'>\s]*\2/gi, "");
}

/**
 * Превращает значение текстового поля в безопасный HTML для рендера:
 * обычный текст экранируется, переносы строк → <br>, а HTML — санитизируется.
 */
export function richTextToHtml(value: string): string {
  const s = value ?? "";
  if (!/<[a-zA-Z][^>]*>/.test(s)) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
  }
  return sanitizeHtml(s);
}
