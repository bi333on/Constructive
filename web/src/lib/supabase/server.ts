import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Серверный клиент Supabase (работает с cookies запроса). */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // В Server Components `set` недоступен — обрабатывается middleware.
          }
        },
      },
    },
  );
}
