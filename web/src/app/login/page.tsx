import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            B
          </div>
          <span className="text-sm font-semibold text-neutral-800">Конструктор сайтов</span>
        </div>
        <h1 className="text-xl font-bold text-neutral-900">Вход</h1>
        <p className="mb-6 mt-1 text-sm text-neutral-500">Войдите, чтобы продолжить работу.</p>
        <AuthForm mode="login" />
        <p className="mt-4 text-center text-sm text-neutral-500">
          Нет аккаунта?{" "}
          <Link href="/signup" className="font-medium text-blue-600 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </main>
  );
}
