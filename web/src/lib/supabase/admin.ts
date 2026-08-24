import { createClient } from "@supabase/supabase-js";

/**
 * Служебный клиент Supabase (service role) — обходит RLS.
 * Используется только на сервере: в webhook'ах платёжных провайдеров.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
