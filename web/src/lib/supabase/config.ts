// Общие проверки переменных окружения Supabase.
// Работает и на сервере, и на клиенте (использует только NEXT_PUBLIC_* переменные).

export interface SupabaseEnv {
  url: string;
  anon: string;
}

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && /^https?:\/\//.test(url) && anon) {
    return { url, anon };
  }
  return null;
}

/** Настроен ли Supabase корректно (валидный URL + anon-ключ). */
export function hasValidSupabaseEnv(): boolean {
  return getSupabaseEnv() !== null;
}
