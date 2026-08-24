"use server";

import { requireUser } from "@/lib/auth";
import { getEnabledProviders } from "@/lib/payments";

export async function subscribeToPlan(planId: string) {
  const { supabase, user } = await requireUser();

  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .single();
  if (!plan) return { error: "Тариф не найден" };

  const provider = getEnabledProviders()[0];
  if (!provider) return { error: "Платёжная система не настроена" };

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const { confirmationUrl } = await provider.createCheckout({
      userId: user.id,
      email: user.email,
      plan,
      successUrl: `${origin}/billing`,
    });
    return { redirectUrl: confirmationUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ошибка оплаты" };
  }
}

export async function cancelSubscription() {
  const { supabase, user } = await requireUser();
  await supabase
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("status", "active");
  await supabase.from("profiles").update({ plan_tier: "free" }).eq("id", user.id);
  return {};
}
