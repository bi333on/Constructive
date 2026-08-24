import { NextResponse } from "next/server";
import { applyWebhookResult } from "@/lib/payments/applyWebhook";
import { rollypayProvider } from "@/lib/payments/rollypay";

export async function POST(request: Request) {
  if (!rollypayProvider.enabled) {
    return new NextResponse("disabled", { status: 404 });
  }

  const result = await rollypayProvider.parseWebhook(
    await request.json(),
    request.headers,
  );
  if (result) {
    await applyWebhookResult(result);
  }
  return NextResponse.json({ ok: true });
}
