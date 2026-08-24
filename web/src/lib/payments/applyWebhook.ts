import { createAdminClient } from "@/lib/supabase/admin";
import type { WebhookResult } from "./types";

/** Применяет результат webhook'а к подписке пользователя. */
export async function applyWebhookResult(result: WebhookResult) {
  if (result.type === "ignored" || !result.userId || !result.planId) return;

  const supabase = createAdminClient();

  if (result.type === "succeeded") {
    // Закрываем предыдущие активные подписки, создаём новую.
    await supabase
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("user_id", result.userId)
      .eq("status", "active");

    await supabase.from("subscriptions").insert({
      user_id: result.userId,
      plan_id: result.planId,
      provider: result.provider,
      provider_subscription_id: result.paymentMethodId ?? result.externalId,
      status: "active",
      current_period_end: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });

    await supabase
      .from("profiles")
      .update({ plan_tier: result.planId })
      .eq("id", result.userId);
  }
}
