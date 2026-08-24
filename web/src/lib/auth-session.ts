import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";

const COOKIE = "builder_session";
const SESSION_DAYS = 30;

export interface SessionUser {
  id: string;
  email: string;
}

export async function createSession(userId: string): Promise<void> {
  const db = getDb();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();

  // Одна активная сессия на пользователя (простота).
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  db.prepare(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
  ).run(token, userId, expiresAt);

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    getDb().prepare("DELETE FROM sessions WHERE id = ?").run(token);
  }
  store.delete(COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;

  const row = getDb()
    .prepare(
      `SELECT u.id, u.email
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > datetime('now')`,
    )
    .get(token) as unknown as SessionUser | undefined;

  return row ?? null;
}

/** Возвращает пользователя или делает redirect на /login. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
