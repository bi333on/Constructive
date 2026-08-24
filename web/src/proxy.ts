import { NextResponse, type NextRequest } from "next/server";

// Бесплатные поддомены: <имя>.BASE_DOMAIN → /site/<имя>/<путь>.
// Само приложение (редактор, дашборд) живёт на основном домене.
export async function proxy(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN?.toLowerCase();
  const host = (request.headers.get("host") ?? "").toLowerCase();

  if (base && host.endsWith(`.${base}`)) {
    const subdomain = host.slice(0, host.length - base.length - 1).toLowerCase();
    if (subdomain && !["www", "app", "admin", "api"].includes(subdomain)) {
      const url = request.nextUrl.clone();
      url.pathname = `/site/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
      url.search = "";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
