import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasValidSupabaseEnv } from "@/lib/supabase/config";
import { BillingClient, type PlanView } from "@/components/billing/BillingClient";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  if (!hasValidSupabaseEnv()) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [plansRes, profileRes, subRes] = await Promise.all([
    supabase.from("plans").select("*").order("price_monthly", { ascending: true }),
    supabase.from("profiles").select("plan_tier").eq("id", user.id).single(),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),
  ]);

  return (
    <BillingClient
      plans={(plansRes.data ?? []) as PlanView[]}
      currentTier={profileRes.data?.plan_tier ?? "free"}
      hasActiveSubscription={!!subRes.data}
    />
  );
}
