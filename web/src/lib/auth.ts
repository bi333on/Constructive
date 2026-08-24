import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Возвращает клиент Supabase и пользователя; редиректит на /login, если нет сессии. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}
