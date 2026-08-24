import { NextResponse, type NextRequest } from "next/server";

// Авторизация отключена (локальный режим на SQLite).
// Прокси оставлен как точка входа для будущих middleware (кэш, редиректы и т.п.).
export async function proxy(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
