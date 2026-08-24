import { NextResponse } from "next/server";
import { applyWebhookResult } from "@/lib/payments/applyWebhook";
import { yookassaProvider } from "@/lib/payments/yookassa";

export async function POST(request: Request) {
  if (!yookassaProvider.enabled) {
    return new NextResponse("disabled", { status: 404 });
  }

  const result = await yookassaProvider.parseWebhook(
    await request.json(),
    request.headers,
  );
  if (result) {
    await applyWebhookResult(result);
  }
  return NextResponse.json({ ok: true });
}
