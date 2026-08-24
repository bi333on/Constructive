import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Endpoint разрешения on-demand TLS для Caddy.
// Caddy вызывает его с ?domain=... — одобряем только домены существующих проектов.

export async function GET(request: Request) {
  const domain = (
    new URL(request.url).searchParams.get("domain") ?? ""
  ).toLowerCase();
  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN?.toLowerCase();

  if (!domain) return deny();

  // Бесплатный поддомен <имя>.BASE_DOMAIN
  if (base && domain.endsWith(`.${base}`)) {
    const subdomain = domain.slice(0, domain.length - base.length - 1);
    if (!subdomain || ["www", "app", "admin", "api"].includes(subdomain)) {
      return deny();
    }
    const row = getDb()
      .prepare("SELECT id FROM projects WHERE subdomain = ?")
      .get(subdomain);
    return row ? allow() : deny();
  }

  // Собственный домен пользователя
  const row = getDb()
    .prepare("SELECT id FROM projects WHERE domain = ?")
    .get(domain);
  return row ? allow() : deny();
}

function allow() {
  return new NextResponse("ok", { status: 200 });
}

function deny() {
  return new NextResponse("denied", { status: 403 });
}
