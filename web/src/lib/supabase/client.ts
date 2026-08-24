"use client";

import { createBrowserClient } from "@supabase/ssr";
import { hasValidSupabaseEnv } from "./config";

/** Настроен ли Supabase (валидный URL + anon-ключ). */
export function isSupabaseConfigured() {
  return hasValidSupabaseEnv();
}

/** Браузерный клиент Supabase. Вызывать только при isSupabaseConfigured(). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
