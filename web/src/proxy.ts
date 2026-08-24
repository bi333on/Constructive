import { NextResponse, type NextRequest } from "next/server";

// Маршрутизация сайтов по Host:
// - <имя>.BASE_DOMAIN (бесплатный поддомен) и собственные домены → /site/<host>/<путь>
// - основной домен → приложение (редактор, дашборд).
export async function proxy(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN?.toLowerCase();
  if (!base) return NextResponse.next({ request });

  let host = (request.headers.get("host") ?? "").toLowerCase();
  if (host.includes(":")) host = host.slice(0, host.lastIndexOf(":"));

  const isMain = host === base || host === `www.${base}`;
  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host);

  if (!isMain && !isLocal) {
    // Реврайт на внутренний маршрут /site/<host>. URL строится из request.nextUrl,
    // чтобы origin совпал с initUrl и Next.js сделал внутренний реврайт
    // (а не внешний прокси, который падает с EPROTO за reverse-proxy).
    const url = request.nextUrl.clone();
    url.pathname = `/site/${host}${url.pathname === "/" ? "" : url.pathname}`;
    url.search = "";
    url.hash = "";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
