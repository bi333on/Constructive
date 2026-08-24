"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, getSessionUser } from "@/lib/auth-session";
import { getDb, newId } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function signUp(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_RE.test(normalized)) return { error: "Некорректный email" };
  if (password.length < 6) return { error: "Пароль должен быть не короче 6 символов" };

  const db = getDb();
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(normalized);
  if (exists) return { error: "Пользователь с таким email уже существует" };

  const id = newId();
  db.prepare(
    "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
  ).run(id, normalized, hashPassword(password));

  await createSession(id);
  redirect("/");
}

export async function signIn(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const db = getDb();
  const row = db
    .prepare("SELECT id, password_hash FROM users WHERE email = ?")
    .get(normalized) as unknown as { id: string; password_hash: string } | undefined;

  if (!row || !verifyPassword(password, row.password_hash)) {
    return { error: "Неверный email или пароль" };
  }

  await createSession(row.id);
  redirect("/");
}

export async function signOut() {
  await destroySession();
  redirect("/login");
}

export async function currentUser() {
  return getSessionUser();
}
